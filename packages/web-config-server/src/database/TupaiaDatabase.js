/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import winston from 'winston';
import autobind from 'react-autobind';
import knex from 'knex';

import { generateId } from './generateId';

export const CONNECTION_CONFIG = {
  host: 'localhost',
  port: process.env.POSTGRES_PORT,
  max: '20',
  idleTimeoutMillis: 60000,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
};

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

export class TupaiaDatabase {
  constructor() {
    autobind(this);
    this.changeHandlers = {};
    const connectToDatabase = async () => {
      this.connection = await knex({
        client: 'pg',
        connection: CONNECTION_CONFIG,
      });
      winston.info('Connected to database');
      return this.connection;
    };
    this.connectionPromise = connectToDatabase();
  }

  destroy() {
    this.connection.destroy();
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
    const connection = await this.connectionPromise;
    if (!connection) {
      throw new Error('Database failed to connect');
    }
    return buildQuery(connection, ...args);
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

  async create(recordType, record, ...additionalRecords) {
    // TODO could be more efficient to put all extra objects into one query
    if (!record.id) {
      record.id = generateId();
    }
    await this.query({
      recordType,
      queryMethod: QUERY_METHODS.INSERT,
      queryMethodParameter: record,
    });

    if (additionalRecords.length === 0) {
      return record;
    }

    const recordsCreated = [record];
    for (let i = 0; i < additionalRecords.length; i++) {
      const additionalRecord = additionalRecords[i];
      const recordCreated = await this.create(recordType, additionalRecord); // eslint-disable-line no-await-in-loop
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

  async updateOrCreate(recordType, where, updatedFields) {
    let record = await this.findOne(recordType, where);
    if (record) {
      const records = await this.update(recordType, where, updatedFields);
      record = records[0];
    } else {
      record = await this.create(recordType, { ...where, ...updatedFields });
    }
    return record;
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
      await this.connectionPromise;
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
  async executeSql(sqlString, parameters = []) {
    if (!this.connection) {
      await this.connectionPromise;
    }

    const result = await this.connection.raw(sqlString, parameters);
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
  query = addWhereClause(query[queryMethod](queryMethodParameter || options.columns), where);

  // Add  sorting information if provided
  if (options.sort) {
    Object.entries(options.sort).forEach(([key, direction]) => {
      query = query.orderBy(key, direction);
    });
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

  // Uncomment to debug database queries
  winston.debug('database query', { query: query.toString() });

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
      return querySoFar.whereRaw(`LOWER(:key:) ${comparator} LOWER(:comparisonValue)`, {
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
