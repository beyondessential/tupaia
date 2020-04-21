/**
 * Tupaia
 * Copyright (c) 2017-2020 Beyond Essential Systems Pty Ltd
 **/

import autobind from 'react-autobind';
import knex from 'knex';
import winston from 'winston';
import { Multilock } from '@tupaia/utils';

import { getConnectionConfig } from './getConnectionConfig';
import { DatabaseChangeChannel } from './DatabaseChangeChannel';
import { generateId } from './utilities/generateId';

const QUERY_METHODS = {
  COUNT: 'count',
  INSERT: 'insert',
  UPDATE: 'update',
  SELECT: 'select',
  DELETE: 'del',
};

export const QUERY_CONJUNCTIONS = {
  AND: '_and_',
  OR: '_or_',
  RAW: '_raw_',
};

export const JOIN_TYPES = {
  INNER: 'inner',
  LEFT: 'left',
  LEFT_OUTER: 'leftOuter',
  RIGHT: 'right',
  RIGHT_OUTER: 'rightOuter',
  OUTER: 'outer',
  FULL_OUTER: 'fullOuter',
  CROSS: 'cross',
  DEFAULT: null,
};

// no math here, just hand-tuned to be as low as possible while
// keeping all the tests passing
const HANDLER_DEBOUNCE_DURATION = 250;

// some part of knex or node-pg struggles with too many bindings, so we batch them in some places
const MAX_BINDINGS_PER_QUERY = 2500; // errors occurred at around 5000 bindings in testing

export class TupaiaDatabase {
  constructor(transactingConnection) {
    autobind(this);
    this.changeHandlers = {};
    this.changeChannel = null; // changeChannel is lazily instantiated - not every database needs it
    this.changeChannelPromise = null;

    // If this instance is not for a specific transaction, it is the singleton instance
    this.isSingleton = !transactingConnection;

    const connectToDatabase = async () => {
      this.connection =
        transactingConnection ||
        (await knex({
          client: 'pg',
          connection: getConnectionConfig(),
        }));
      return true;
    };
    this.connectionPromise = connectToDatabase();

    this.handlerLock = new Multilock();
  }

  maxBindingsPerQuery = MAX_BINDINGS_PER_QUERY;

  closeConnections() {
    if (this.changeChannel) {
      this.changeChannel.close();
    }
    this.connection.destroy();
  }

  getOrCreateChangeChannel() {
    if (!this.changeChannel) {
      this.changeChannel = new DatabaseChangeChannel();
      this.changeChannel.addChangeHandler(this.notifyChangeHandlers);
      this.changeChannelPromise = this.changeChannel.ping();
    }
    return this.changeChannel;
  }

  async waitUntilConnected() {
    await this.connectionPromise;
    if (this.changeChannel) {
      await this.waitForChangeChannel();
    }
  }

  async waitForChangeChannel() {
    this.getOrCreateChangeChannel();
    return this.changeChannelPromise;
  }

  addChangeHandlerForCollection(collectionName, changeHandler, key = generateId()) {
    // if a change handler is being added, this db needs a change channel - make sure it's instantiated
    this.getOrCreateChangeChannel();
    this.getChangeHandlersForCollection(collectionName)[key] = changeHandler;
  }

  getHandlersForChange(change) {
    const { handler_key: specificHandlerKey, record_type: recordType } = change;
    const handlersForCollection = this.getChangeHandlersForCollection(recordType);
    if (specificHandlerKey) {
      return handlersForCollection[specificHandlerKey]
        ? [handlersForCollection[specificHandlerKey]]
        : [];
    }
    return Object.values(handlersForCollection);
  }

  async notifyChangeHandlers(change) {
    const unlock = this.handlerLock.createLock(change.record_id);
    const handlers = this.getHandlersForChange(change);
    try {
      for (let i = 0; i < handlers.length; i++) {
        try {
          await handlers[i](change);
        } catch (e) {
          winston.error(e);
        }
      }
    } finally {
      unlock();
    }
  }

  async waitForAllChangeHandlers() {
    return this.handlerLock.waitWithDebounce(HANDLER_DEBOUNCE_DURATION);
  }

  getChangeHandlersForCollection(collectionName) {
    // Instantiate the array if no change handlers currently exist for the collection
    if (!this.changeHandlers[collectionName]) {
      this.changeHandlers[collectionName] = {};
    }
    return this.changeHandlers[collectionName];
  }

  wrapInTransaction(wrappedFunction) {
    return this.connection.transaction(transaction =>
      wrappedFunction(new TupaiaDatabase(transaction)),
    );
  }

  async fetchSchemaForTable(databaseType) {
    await this.waitUntilConnected();
    return this.connection(databaseType).columnInfo();
  }

  /**
   * Builds a query on the database, which can be awaited to reveal the result.
   * Implementation notes: If the connection is available, it will return the knex built query
   * without a wrapping Promise. This is necessary for nested queries to function correctly. If the
   * connection is not yet available, it will await the connection, so necessarily return the built
   * query inside a wrapped promise. This Promise-wrapped query can still be awaited as normal to
   * reveal a result, but cannot be passed back in as an innerQuery during nesting. So there is a
   * small and very rare hole whereby if on first starting the server, the connection is pending and
   * someone runs a nested query, it will crash.
   */
  query(...args) {
    if (!this.connection) {
      // If not yet connected, wait until we are, then run the query
      return this.queryWhenConnected(...args);
    }
    // We are already connected, query immediately
    return buildQuery(this.connection, ...args);
  }

  /**
   * Asynchronously await the database connection to be made, and then build the query as per normal
   */
  async queryWhenConnected(...args) {
    await this.waitUntilConnected();
    return buildQuery(this.connection, ...args);
  }

  find(recordType, where = {}, options = {}, queryMethod = QUERY_METHODS.SELECT) {
    if (options.subQuery) {
      const { recordType: subRecordType, where: subWhere, ...subOptions } = options.subQuery;
      options.innerQuery = this.find(subRecordType, subWhere, subOptions);
    }
    return this.query(
      {
        recordType,
        queryMethod,
      },
      where,
      options,
    );
  }

  async findOne(recordType, where, options) {
    const results = await this.find(recordType, where, { ...options, limit: 1 });
    return results && results.length > 0 ? results[0] : null;
  }

  findById(recordType, id, options) {
    return this.findOne(recordType, { id }, options);
  }

  async findRecursiveTree(recordType, id, idKey = 'id', parentIdKey = 'parent_id') {
    // See https://stackoverflow.com/questions/34954873/get-entire-hierarchy-of-parents-from-a-given-child-in-postgresql
    const sql = `
     with recursive findParents as (
       select * from ${recordType}
         where ${idKey} = '${id}'
       union
         select ${recordType}.* from ${recordType}
           join findParents on findParents.${parentIdKey} = ${recordType}.${idKey}
     )

     select * from findParents;
   `;

    return this.executeSql(sql);
  }

  async findWithParents(recordType, id, idKey = 'id', parentIdKey = 'parent_id') {
    return this.findRecursiveTree(recordType, id, idKey, parentIdKey);
  }

  async findWithChildren(recordType, id, idKey = 'id', parentIdKey = 'parent_id') {
    return this.findRecursiveTree(recordType, id, parentIdKey, idKey);
  }

  async findOrCreate(recordType, where, extraFieldsIfCreating = {}) {
    const record = await this.findOne(recordType, where);
    return record || this.create(recordType, { ...where, ...extraFieldsIfCreating });
  }

  async count(recordType, where, options) {
    // If just a simple query without options, use the more efficient knex count method
    const result = await this.find(recordType, where, options, QUERY_METHODS.COUNT);
    return parseInt(result[0].count, 10);
  }

  async create(recordType, record) {
    if (!record.id) {
      record.id = generateId();
    }
    await this.query({
      recordType,
      queryMethod: QUERY_METHODS.INSERT,
      queryMethodParameter: record,
    });

    return record;
  }

  async createMany(recordType, records) {
    // TODO could be more efficient to create all records in one query
    const recordsCreated = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordCreated = await this.create(recordType, record);
      recordsCreated.push(recordCreated);
    }
    return recordsCreated;
  }

  /**
   * Updates all records that match the criteria to have the values in updatedFields
   * @param {string} recordType     Records of this type will be updated
   * @param {object} where          Records matching this criteria will be updated
   * @param {object} updatedFields  The new values that should be in the record
   */
  async update(recordType, where, updatedFields) {
    return this.query(
      {
        recordType,
        queryMethod: QUERY_METHODS.UPDATE,
        queryMethodParameter: updatedFields,
      },
      where,
    );
  }

  async updateById(recordType, id, updatedFields) {
    return this.update(recordType, { id }, updatedFields);
  }

  async updateOrCreate(recordType, identifiers, updatedFields) {
    // Put together the full new record that will be created, if no matching record exists
    const newId = generateId(); // Generate a new id, in no id was provided
    const updatedFieldsWithoutUndefined = JSON.parse(JSON.stringify(updatedFields));
    const newRecord = { id: newId, ...identifiers, ...updatedFieldsWithoutUndefined };

    const buildQueryList = (object, formatter) =>
      Object.keys(object)
        .map(formatter)
        .join(',');

    // Build string of all column names to be inserted on new record creation
    const columns = buildQueryList(newRecord, columnName => `:old_column_${columnName}:`);

    // Build string of all values to be inserted on new record creation
    const values = buildQueryList(newRecord, columnName => `:${columnName}`);

    // Build string of column names to detect a conflict on, i.e. the identifying columns
    const conflict = buildQueryList(identifiers, columnName => `:old_column_${columnName}:`);

    // Build string of just those fields to update if a matching record exists
    const updates = buildQueryList(
      updatedFieldsWithoutUndefined,
      columnName => `:old_column_${columnName}: = :new_column_${columnName}:`,
    );

    // Put together all parameters that may need to be bound, including the column names and values
    const allParameterBindings = {
      recordType,
      ...newRecord,
    };
    Object.keys(newRecord).forEach(columnName => {
      allParameterBindings[`old_column_${columnName}`] = columnName; // Use 'old_column_' prefix
    });
    Object.keys(updatedFieldsWithoutUndefined).forEach(columnName => {
      // If updating on conflict, we can use the special postgres "excluded" table name to refer to
      // the record that failed to be inserted. Use 'new_column_' as the prefix
      allParameterBindings[`new_column_${columnName}`] = `excluded.${columnName}`;
    });

    // Run the sql
    const result = await this.executeSql(
      `
        INSERT INTO :recordType: (${columns})
          VALUES (${values})
          ON CONFLICT (${conflict}) DO UPDATE
            SET ${updates}
          RETURNING *;
      `,
      allParameterBindings,
    );
    return result[0];
  }

  async delete(recordType, where = {}) {
    return this.query(
      {
        recordType,
        queryMethod: QUERY_METHODS.DELETE,
      },
      where,
    );
  }

  async deleteById(recordType, id) {
    return this.delete(recordType, { id });
  }

  markRecordsAsChanged(recordType, records) {
    this.getOrCreateChangeChannel().publishRecordUpdates(recordType, records);
  }

  /**
   * Force a change to be recorded against the records matching the search criteria, and return
   * those records.
   */
  async markAsChanged(recordType, where, options) {
    const records = await this.find(recordType, where, options);
    this.markRecordsAsChanged(recordType, records);
    return records;
  }

  async getSetting(key) {
    const setting = await this.findOne('setting', { key: key });
    return setting ? setting.value : null;
  }

  setSetting(key, value) {
    return this.updateOrCreate('setting', { key }, { value });
  }

  clearSetting(key) {
    return this.delete('setting', { key });
  }

  /**
   * Execute a sum query.
   *
   * eg:
   * this.database.sum('user_reward', ['pigs', 'coconuts'], {
   *   user_id: userId,
   * });
   * could return:
   * { coconuts: 99, pigs: 55 }
   *
   * @param {string} table
   * Database table to sum from.
   * @param {array} fields
   * An array of fields to sum.
   * @param {object} where
   * Conditions for the sum query.
   */
  async sum(table, fields = [], where = {}) {
    if (!this.connection) {
      await this.waitUntilConnected();
    }

    const query = this.connection(table);

    fields.forEach(fieldToSum => {
      query.sum(`${fieldToSum} as ${fieldToSum}`);
    });

    const result = await query.where(where);
    const processedResult = {};

    // Convert counts to integers.
    Object.keys(result[0]).forEach(sumKey => {
      processedResult[sumKey] = parseInt(result[0][sumKey], 10);
    });

    return processedResult;
  }

  /**
   * Runs an arbitrary SQL query against the database.
   *
   * Use only for situations in which Knex is not able to assemble a query.
   */
  async executeSql(sqlString, parametersToBind) {
    if (!this.connection) {
      await this.waitUntilConnected();
    }

    const result = await this.connection.raw(sqlString, parametersToBind);
    return result.rows;
  }
}

/**
 * Builds the query specified by the parameters passed in. The returned query can either be
 * 'awaited' (in which case it will execute and return the result), or passed back in to
 * this.query as part of a nested query.
 */
function buildQuery(connection, queryConfig, where = {}, options = {}) {
  const { recordType, queryMethod, queryMethodParameter } = queryConfig;
  let query = connection(recordType); // Query starts as just the table, but will be built up

  // If an innerQuery is defined, make the outer query wrap it
  if (options.innerQuery) {
    query = query.from(options.innerQuery);
  }

  // Add join options if provided
  if (options.joinWith) {
    query = addJoin(query, recordType, options);
  }

  // Add multiple join options if provided
  if (options.multiJoin) {
    options.multiJoin.forEach(joinOptions => (query = addJoin(query, recordType, joinOptions)));
  }

  // Add filtering (or WHERE) details if provided
  const columns =
    options.columns &&
    options.columns.map(columnSpec => {
      if (typeof columnSpec === 'string') return columnSpec;
      const [alias, selector] = Object.entries(columnSpec)[0];
      return { [alias]: connection.raw(selector) };
    });
  query = addWhereClause(query[queryMethod](queryMethodParameter || columns), where);

  // Add sorting information if provided
  if (options.sort) {
    for (const sortKey of options.sort) {
      const [columnName, direction] = sortKey.split(' ');
      query = query.orderBy(columnName, direction);
    }
  }

  // Restrict the number of rows returned if limit provided
  if (options.limit) {
    query = query.limit(options.limit);
  }

  // Allow results to be returned offset for pagination
  if (options.offset) {
    query = query.offset(options.offset);
  }

  // Alias the query result (for use in nested queries) if name provided
  if (options.name) {
    query = query.as(options.name);
  }

  if (queryMethod === QUERY_METHODS.UPDATE) {
    // Return all fields after
    query.returning('*');
  }

  // Now constructed, the query can either be 'awaited' (in which case it will execute and return
  // the result), or passed back in to this.query as part of a nested query.
  return query;
}

function addWhereClause(baseQuery, where) {
  if (!where) {
    return baseQuery;
  }
  return Object.entries(where).reduce((querySoFar, [key, value]) => {
    // Providing the _and_ or the _or_ keys will use the contained criteria as a bracket wrapped
    // subsection of the broader WHERE clause
    if (key === QUERY_CONJUNCTIONS.AND) {
      return querySoFar.andWhere(function() {
        addWhereClause(this, value); // Within the function, 'this' refers to the query so far
      });
    } else if (key === QUERY_CONJUNCTIONS.OR) {
      return querySoFar.orWhere(function() {
        addWhereClause(this, value); // Within the function, 'this' refers to the query so far
      });
    } else if (key === QUERY_CONJUNCTIONS.RAW) {
      const { sql = value, parameters } = value;
      return querySoFar.whereRaw(sql, parameters);
    }
    if (value === undefined) {
      return querySoFar; // Ignore undefined criteria
    }
    if (value === null) {
      return querySoFar.whereNull(key);
    }
    const {
      comparisonType = 'where',
      comparator = Array.isArray(value) ? 'in' : '=',
      comparisonValue = value,
      ignoreCase = false,
    } = value;
    if (ignoreCase) {
      // When manipulating case, cast the field as text
      return querySoFar.whereRaw(`LOWER(${key}::text) ${comparator} LOWER('${comparisonValue}')`, {
        key,
        comparisonValue,
      });
    }
    const { args = [comparator, comparisonValue] } = value;
    return querySoFar[comparisonType](key, ...args);
  }, baseQuery);
}

function addJoin(baseQuery, recordType, joinOptions) {
  // Default join condition is of the form 'primary.id = secondary.primary_id',
  // e.g. survey_response.id = answer.survey_response_id
  const {
    joinWith,
    joinType = JOIN_TYPES.DEFAULT,
    joinCondition = [`${recordType}.id`, `${joinWith}.${recordType}_id`],
    joinConditions = [joinCondition],
  } = joinOptions;
  const joinMethod = joinType ? `${joinType}Join` : 'join';
  return baseQuery[joinMethod](joinWith, function() {
    const joining = this.on(...joinConditions[0]);
    for (
      let joinConditionIndex = 1;
      joinConditionIndex < joinConditions.length;
      joinConditionIndex++
    ) {
      joining.andOn(...joinConditions[joinConditionIndex]);
    }
  });
}
