/** @typedef {import('knex').Knex} Knex */

import knex from 'knex';
import autobind from 'react-autobind';
import winston from 'winston';

import { hashStringToInt } from '@tupaia/tsutils';
import { getEnvVarOrDefault, NotImplementedError } from '@tupaia/utils';
import { SCHEMA_NAMES } from './constants';
import { generateId } from './utilities';
import {
  MAX_BINDINGS_PER_QUERY,
  runDatabaseFunctionInBatches,
} from './utilities/runDatabaseFunctionInBatches';

export const QUERY_METHODS = {
  COUNT: 'count',
  COUNT_DISTINCT: 'countDistinct',
  INSERT: 'insert',
  UPDATE: 'update',
  SELECT: 'select',
  DISTINCT: 'distinct',
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

// list valid behaviour so we can validate against sql injection
const VALID_CAST_TYPES = ['text', 'text[]', 'date'];
const VALID_COMPARISON_TYPES = ['where', 'whereBetween', 'whereIn', 'orWhere'];
export const WHERE_SUBQUERY_CLAUSES = {
  EXISTS: 'exists',
  NOT_EXISTS: 'notExists',
};

const COMPARATORS = {
  LIKE: 'like',
  ILIKE: 'ilike',
};

/**
 * We only support specific functions in SELECT statements to avoid SQL injection.
 *
 * @privateRemarks Because of the (appropriately) conservative way Knex handles identifiers in
 * parameterised queries, supported functions may need custom handling in {@link getColSelector}.
 * Otherwise, Knex will attempt to interpret function calls as identifiers. For example,
 * `COALESCE(foo, bar)` would otherwise become `"COALESCE(FOO", "bar)"`.
 *
 * Nested function calls unsupported.
 *
 * @see getColSelector
 */
const supportedFunctions = ['ST_AsGeoJSON', 'COALESCE', 'TRIM'];

const RAW_INPUT_PATTERN = /(^CASE)|(^to_timestamp)/;

export class BaseDatabase {
  static IS_CHANGE_HANDLER_SUPPORTED = false;

  /**
   * @privateRemarks No special maths for the default value here, just hand-tuned with a remote dev database to
   * allow the vast majority of queries through. Only COUNT queries on survey_response from accounts
   * without admin privileges are really expected to time out.
   */
  #fastCountTimeoutMs = Number.parseInt(getEnvVarOrDefault('FAST_DB_COUNT_TIMEOUT_MS', '400'));

  /**
   * If true, always uses `count()` method, even when `countFast()` is called.
   * @type {boolean}
   */
  #forceTrueCount = !!getEnvVarOrDefault('FORCE_TRUE_DB_COUNT', '');

  /** @type {Knex} */
  connection;

  /** @type {Promise<true>} */
  connectionPromise;

  constructor(transactingConnection, transactingChangeChannel, clientType, getConnectionConfigFn) {
    if (this.constructor === BaseDatabase) {
      throw new Error('Cannot instantiate abstract BaseDatabase class');
    }

    autobind(this);
    this.transactingChangeChannel = transactingChangeChannel;
    this.changeChannelPromise = null;

    // If this instance is not for a specific transaction, it is the singleton instance
    this.isSingleton = !transactingConnection;

    if (transactingConnection) {
      this.connection = transactingConnection;
      this.connectionPromise = Promise.resolve(true);
      this.setCustomTypeParsers();
    } else {
      /** @returns {Promise<true>} */
      const connectToDatabase = async () => {
        this.connection = knex({
          client: clientType,
          connection: getConnectionConfigFn(),
        });
        return true;
      };
      this.connectionPromise = connectToDatabase();
      this.setCustomTypeParsers();
    }
  }

  maxBindingsPerQuery = MAX_BINDINGS_PER_QUERY;

  generateId = generateId;

  /**
   * Subclasses should override parsers for certain PostgreSQL types as needed based on their
   * PostgreSQL client’s default parsers (e.g. node-postgres, PGlite). If no overrides needed,
   * override with an empty method.
   * @abstract
   * @returns {Promise<void>}
   */
  async setCustomTypeParsers() {
    throw new NotImplementedError('Subclass should override setCustomTypeParsers');
  }

  async closeConnections() {
    return await this.connection.destroy();
  }

  async waitUntilConnected() {
    await this.connectionPromise;
  }

  /**
   * @abstract
   * @param {<ReturnT = unknown, DatabaseT extends BaseDatabase = BaseDatabase>(models: DatabaseT) => Promise<ReturnT>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise<ReturnT>}
   */
  async wrapInTransaction(_wrappedFunction, _transactionConfig) {
    throw new NotImplementedError('wrapInTransaction should be implemented by the child class');
  }

  /**
   * @param {<ReturnT = unknown, DatabaseT extends BaseDatabase = BaseDatabase>(models: DatabaseT) => Promise<ReturnT>} wrappedFunction
   * @param {Omit<Knex.TransactionConfig, 'readOnly'>} [transactionConfig]
   * @returns {Promise<ReturnT>}
   */
  async wrapInReadOnlyTransaction(wrappedFunction, transactionConfig = {}) {
    return await this.wrapInTransaction(wrappedFunction, { ...transactionConfig, readOnly: true });
  }

  async fetchSchemaForTable(databaseRecord, schemaName) {
    await this.waitUntilConnected();
    return this.connection(databaseRecord).withSchema(schemaName).columnInfo();
  }

  /**
   * @returns {string} The database's timezone
   */
  async getTimezone() {
    return (await this.executeSql('show timezone'))[0];
  }

  /**
   * Acquires an advisory lock for the current transaction
   * Lock will be immediately released once the transaction ends
   * (https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS)
   * @param {string} lockKey unique identifier key for the lock
   */
  async acquireAdvisoryLock(lockKey) {
    const lockKeyInt = hashStringToInt(lockKey); // Locks require bigint key, so must convert key to int
    return await this.executeSql('SELECT pg_advisory_xact_lock(?)', [lockKeyInt]);
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

  /**
   *
   * @param {string} recordType
   * @param {Record<string, unknown>} [where]
   * @param {Record<string, unknown>} [options]
   * @param {string} [queryMethod]
   * @returns
   */
  find(recordType, where = {}, options = {}, queryMethod = null, queryMethodParameter = null) {
    if (options.subQuery) {
      const { recordType: subRecordType, where: subWhere, ...subOptions } = options.subQuery;
      options.innerQuery = this.find(subRecordType, subWhere, subOptions);
    }
    return this.query(
      {
        recordType,
        queryMethod:
          queryMethod || (options.distinct ? QUERY_METHODS.DISTINCT : QUERY_METHODS.SELECT),
        queryMethodParameter,
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
         where ${idKey} in ('${Array.isArray(id) ? id.join("','") : id}')
       union
         select distinct(${recordType}.*) from ${recordType}
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
    await this.create(
      recordType,
      { ...where, ...extraFieldsIfCreating },
      { notExists: { queryMethod: QUERY_METHODS.SELECT, recordType, where } },
    );
    return this.findOne(recordType, where);
  }

  async count(recordType, where, options) {
    // If just a simple query without options, use the more efficient knex count method
    const result = await this.find(recordType, where, options, QUERY_METHODS.COUNT);
    return Number.parseInt(result[0].count, 10);
  }

  /**
   * Same as {@link count}, but aborts after a timeout. Use this when providing the exact record
   * count is merely an enhancement, not critical information in the context. A return value of
   * `Number.POSITIVE_INFINITY` indicates there are too many to count within reasonable time.
   */
  async countFast(recordType, where, options) {
    if (this.#forceTrueCount) return await this.count(recordType, where, options);

    let result;
    try {
      result = await this.find(recordType, where, options, QUERY_METHODS.COUNT).timeout(
        this.#fastCountTimeoutMs,
        { cancel: true },
      );
    } catch (error) {
      if (error.name === 'KnexTimeoutError') {
        winston.debug(
          `[BaseDatabase#countFast] Counting ${recordType} records timed out. Returning infinity.`,
        );
        return Number.POSITIVE_INFINITY;
      }
      throw error;
    }

    return Number.parseInt(result[0].count, 10);
  }

  async create(recordType, record, where, schemaName) {
    if (!record.id) {
      record.id = this.generateId();
    }
    await this.query(
      {
        recordType,
        queryMethod: QUERY_METHODS.INSERT,
        queryMethodParameter: record,
      },
      where,
      { schemaName },
    );

    return record;
  }

  async createMany(recordType, records, schemaName = SCHEMA_NAMES.PUBLIC, options = {}) {
    const { shouldGenerateId = true } = options;

    // generate ids for any records that don't have them
    const sanitizedRecords = shouldGenerateId
      ? records.map(r => (r.id ? r : { id: this.generateId(), ...r }))
      : records;
    await runDatabaseFunctionInBatches(sanitizedRecords, async batchOfRecords =>
      this.query(
        {
          recordType,
          queryMethod: QUERY_METHODS.INSERT,
          queryMethodParameter: batchOfRecords,
        },
        {},
        { ...options, schemaName },
      ),
    );
    return sanitizedRecords;
  }

  /**
   * Updates all records that match the criteria to have the values in updatedFields
   * @param {string} recordType     Records of this type will be updated
   * @param {object} where          Records matching this criteria will be updated
   * @param {object} updatedFields  The new values that should be in the record
   */
  async update(recordType, where, updatedFields, schemaName) {
    return this.query(
      {
        recordType,
        queryMethod: QUERY_METHODS.UPDATE,
        queryMethodParameter: updatedFields,
      },
      where,
      { schemaName },
    );
  }

  async updateById(recordType, id, updatedFields) {
    return this.update(recordType, { id }, updatedFields);
  }

  async updateOrCreate(recordType, identifiers, updatedFields) {
    // Put together the full new record that will be created, if no matching record exists
    const newId = this.generateId(); // Generate a new id, in case no id was provided
    const updatedFieldsWithoutUndefined = JSON.parse(JSON.stringify(updatedFields));
    const newRecord = { id: newId, ...identifiers, ...updatedFieldsWithoutUndefined };

    const buildQueryList = (object, formatter) => Object.keys(object).map(formatter).join(',');

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

  async delete(recordType, where = {}, schemaName = SCHEMA_NAMES.PUBLIC) {
    return this.query(
      {
        recordType,
        queryMethod: QUERY_METHODS.DELETE,
      },
      where,
      { schemaName },
    );
  }

  async deleteById(recordType, id) {
    return this.delete(recordType, { id });
  }

  async getSetting(key) {
    const setting = await this.findOne('setting', { key });
    return setting ? setting.value : null;
  }

  setSetting(key, value) {
    return this.updateOrCreate('setting', { key }, { value });
  }

  clearSetting(key) {
    return this.delete('setting', { key });
  }

  /**
   * Runs an arbitrary SQL query against the database.
   *
   * Use only for situations in which Knex is not able to assemble a query.
   *
   * @param {string} sqlString
   * @param {any[] | Record<string, any> | undefined} [parametersToBind]
   * @template Result
   * @returns {Promise<Result>} execution result
   */
  async executeSql(sqlString, parametersToBind = []) {
    if (!this.connection) {
      await this.waitUntilConnected();
    }

    const result = await this.connection.raw(sqlString, parametersToBind);
    return result.rows;
  }

  async executeSqlInBatches(arrayToBeBatched, generateSql, batchSize) {
    return runDatabaseFunctionInBatches(
      arrayToBeBatched,
      async batch => {
        const [sql, substitutions] = generateSql(batch);
        return this.executeSql(sql, substitutions);
      },
      batchSize,
    );
  }

  commitTransaction() {
    return this.connection.commit();
  }

  get isWithinTransaction() {
    return this.connection.isTransaction;
  }
}

/**
 * Builds the query specified by the parameters passed in. The returned query can either be
 * 'awaited' (in which case it will execute and return the result), or passed back in to
 * this.query as part of a nested query.
 * @param {knex.Knex} connection
 * @param {Record<string, unknown>} queryConfig
 * @param {Record<string, unknown>} where
 * @param {Record<string, unknown>} options
 * @param {knex.QueryBuilder} baseQuery
 * @returns {knex.Knex}
 */
function buildQuery(connection, queryConfig, where = {}, options = {}, baseQuery = null) {
  const { recordType, queryMethod, queryMethodParameter } = queryConfig;

  let query = baseQuery || connection(recordType); // Query starts as just the table, but will be built up

  if (options.schemaName) {
    query = query.withSchema(options.schemaName);
  }

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
  // Each column can be specified as a string (e.g. 'id'), or if aliasing is required, as an object
  // with one entry, e.g. { user_id: 'user_account.id' }
  const columns =
    options.columns &&
    options.columns.map(columnSpec => {
      if (typeof columnSpec === 'string') return columnSpec;
      const [alias, selector] = Object.entries(columnSpec)[0];

      if (selector?.castAs) {
        const { castAs } = selector;
        if (!VALID_CAST_TYPES.includes(castAs)) {
          throw new Error(`Cannot cast as ${castAs}`);
        }
        return { [alias]: connection.raw(`??::${castAs}`, [alias]) };
      }

      // Special case to handle allowlisted SQL functions, namely for selecting GeoJSON and COALESCE
      // attributes. Avoid generic handling of functions to keep out SQL injection vulnerabilities.
      for (const func of supportedFunctions) {
        if (selector.includes(func)) {
          const [, argsString] = selector.match(new RegExp(`${func}\\((.*)\\)`));
          const args = argsString.split(',').map(arg => arg.trim());
          return {
            [alias]: connection.raw(`${func}(${args.map(() => '??').join(',')})`, [...args]),
          };
        }
      }

      // Special case to handle raw input statements, otherwise they get interpreted as column names
      if (RAW_INPUT_PATTERN.test(selector)) {
        return { [alias]: connection.raw(selector) };
      }

      return { [alias]: connection.raw('??', [selector]) };
    });
  query = addWhereClause(connection, query[queryMethod](queryMethodParameter || columns), where);

  // Add sorting information if provided
  if (options.sort) {
    for (const sortKey of options.sort) {
      const [columnName, direction] = sortKey.split(' ');
      query = query.orderBy(columnName, direction);
    }
  }

  if (options.withRecursive) {
    query = query.withRecursive(
      options.withRecursive.alias,
      connection.raw(options.withRecursive.query, options.withRecursive.parameters),
    );
  }

  // Add raw SQL sort options
  if (options.rawSort) {
    query = query.orderByRaw(options.rawSort);
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

  if (options.onConflictMerge) {
    // onConflictMerge is an array of columns to merge conflicts for
    query = query.onConflict(options.onConflictMerge).merge();
  }

  if (options.onConflictIgnore) {
    // onConflictIgnore is an array of columns to ignore conflicts for
    query = query.onConflict(options.onConflictIgnore).ignore();
  }

  if (queryMethod === QUERY_METHODS.UPDATE) {
    // Return all fields after
    query.returning('*');
  }

  if (process.env.DB_VERBOSE === 'true' || process.env.DB_VERBOSE === '1') {
    winston.info(query.toString());
  }

  // Now constructed, the query can either be 'awaited' (in which case it will execute and return
  // the result), or passed back in to this.query as part of a nested query.
  return query;
}

function sanitizeComparisonValue(comparator, comparisonValue) {
  switch (comparator) {
    case COMPARATORS.LIKE:
    case COMPARATORS.ILIKE: {
      // escape underscores, as they are treated as wildcards in postgres which we generally don't want
      return comparisonValue.replaceAll('_', '\\_');
    }
    default: {
      return comparisonValue;
    }
  }
}

function addWhereClause(connection, baseQuery, where) {
  if (!where) {
    return baseQuery;
  }
  return Object.entries(where).reduce((querySoFar, [key, value]) => {
    // Providing the _and_ or the _or_ keys will use the contained criteria as a bracket wrapped
    // subsection of the broader WHERE clause
    if (key === QUERY_CONJUNCTIONS.AND) {
      return querySoFar.andWhere(function () {
        addWhereClause(connection, this, value); // Within the function, 'this' refers to the query so far
      });
    }
    if (key === QUERY_CONJUNCTIONS.OR) {
      return querySoFar.orWhere(function () {
        addWhereClause(connection, this, value); // Within the function, 'this' refers to the query so far
      });
    }
    if (key === QUERY_CONJUNCTIONS.RAW) {
      const { sql = value, parameters } = value;
      return querySoFar.whereRaw(sql, parameters);
    }
    if (key === WHERE_SUBQUERY_CLAUSES.EXISTS) {
      return querySoFar.whereExists(function () {
        const { queryMethod, recordType, where: subWhere, options: subOptions } = value;
        buildQuery(connection, { queryMethod, recordType }, subWhere, subOptions, this);
      });
    }
    if (key === WHERE_SUBQUERY_CLAUSES.NOT_EXISTS) {
      return querySoFar.whereNotExists(function () {
        const { queryMethod, recordType, where: subWhere, options: subOptions } = value;
        buildQuery(connection, { queryMethod, recordType }, subWhere, subOptions, this);
      });
    }
    if (value === undefined) {
      return querySoFar; // Ignore undefined criteria
    }
    if (value === null) {
      const columnKey = getColSelector(connection, key);
      return querySoFar.whereNull(columnKey);
    }
    const {
      comparisonType = 'where',
      comparator = Array.isArray(value) ? 'in' : '=',
      comparisonValue = value,
      castAs,
    } = value;
    if (castAs && !VALID_CAST_TYPES.includes(castAs)) {
      throw new Error(`Cannot cast as ${castAs}`);
    }
    if (!VALID_COMPARISON_TYPES.includes(comparisonType)) {
      throw new Error(`Cannot compare using ${comparisonType}`);
    }

    const columnKey = getColSelector(connection, key);

    const columnSelector = castAs ? connection.raw(`??::${castAs}`, [columnKey]) : columnKey;

    const { args = [comparator, sanitizeComparisonValue(comparator, comparisonValue)] } = value;
    return querySoFar[comparisonType](columnSelector, ...args);
  }, baseQuery);
}

function addJoin(baseQuery, recordType, joinOptions) {
  // Default join condition is of the form 'primary.id = secondary.primary_id',
  // e.g. survey_response.id = answer.survey_response_id
  const {
    joinWith,
    joinAs = joinWith,
    joinType = JOIN_TYPES.DEFAULT,
    joinCondition = [`${recordType}.id`, `${joinAs}.${recordType}_id`],
    joinConditions = [joinCondition],
  } = joinOptions;
  const joinMethod = joinType ? `${joinType}Join` : 'join';
  return baseQuery[joinMethod](`${joinWith} as ${joinAs}`, function () {
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

/**
 * @param {Knex} connection
 * @param {string} inputColStr
 * @returns {Knex.Raw | string}
 *
 * @privateRemarks
 * This sanitisation step fails if the input uses both JSON operators and the `COALESCE` function.
 *
 * Nested {@link supportedFunctions} calls are unsupported; they’ll be sanitised into invalid SQL
 * syntax.
 *
 * Warning: SQL is not a regular language. Don’t attempt to use RegExp to parse more generic SQL
 * expressions unless you’re absolutely confident it’s watertight.
 *
 * @see supportedFunctions
 */
function getColSelector(connection, inputColStr) {
  const jsonOperatorPattern = /->>?/g;
  if (jsonOperatorPattern.test(inputColStr)) {
    const params = inputColStr.split(jsonOperatorPattern);
    const allButFirst = params.slice(1);
    const lastIndexOfLookupAsText = inputColStr.lastIndexOf('->>');
    const lastIndexOfLookupAsJson = inputColStr.lastIndexOf('->');
    const selector = lastIndexOfLookupAsText >= lastIndexOfLookupAsJson ? '#>>' : '#>';

    // Turn `config->item->>colour` into `config #>> '{item,colour}'`
    // For some reason, Knex fails when we try to convert it to `config->'item'->>'colour'`
    return connection.raw(`?? ${selector} '{${allButFirst.map(() => '??').join(',')}}'`, params);
  }

  /**
   * Special handling of COALESCE() - one of the {@link supportedFunctions} - to treat its arguments
   * as identifiers individually rather than trying to treat ‘COALESCE(foo, bar)’ as a single
   * identifier.
   */
  const coalescePattern = /^COALESCE\(.+\)$/;
  if (coalescePattern.test(inputColStr)) {
    const [, argsString] = inputColStr.match(/^COALESCE\((.+)\)$/);
    const bindings = argsString.split(',').map(arg => arg.trim());
    const identifiers = bindings.map(() => '??');

    return connection.raw(`COALESCE(${identifiers})`, bindings);
  }

  // Special handling of raw input statements
  if (RAW_INPUT_PATTERN.test(inputColStr)) {
    return connection.raw(inputColStr);
  }

  const asGeoJsonPattern = /^ST_AsGeoJSON\((.+)\)$/;
  if (asGeoJsonPattern.test(inputColStr)) {
    const [, argsString] = inputColStr.match(asGeoJsonPattern);
    return connection.raw(`ST_AsGeoJSON(${argsString})`);
  }

  return inputColStr;
}
