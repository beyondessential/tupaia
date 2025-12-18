import { ensure } from '@tupaia/tsutils';
import { DatabaseError, reduceToDictionary } from '@tupaia/utils';
import { QUERY_CONJUNCTIONS } from './TupaiaDatabase';
import { runDatabaseFunctionInBatches } from './utilities/runDatabaseFunctionInBatches';

export class DatabaseModel {
  otherModels = {};

  constructor(database, schema = null) {
    this.database = database;

    // schema promise will resolve with information about the columns on the table in the database,
    // e.g.: { id: { type: 'text', maxLength: null, nullable: false, defaultValue: null } }

    this.schemaPromise = schema ? Promise.resolve(schema) : this.startSchemaFetch();

    this.cache = {};
    this.cachedFunctionInvalidationCancellers = {};

    /**
     * @type {Record<string, (fieldName?: string) => unknown> | null}
     */
    this.customColumnSelectors = null;

    // If this model uses the singleton database, it is probably long running, so be sure to
    // invalidate the cache any time a change is detected. Non-singleton models are those created
    // during transactions, so are short lived and unlikely to need cache invalidation - thus we
    // avoid making an additional connection to pubsub and just leave their cache untouched
    if (this.database.isSingleton) {
      if (this.cacheEnabled) {
        // fully reset cache on any change to this model's records
        this.database.addChangeHandlerForCollection(this.DatabaseRecordClass.databaseRecord, () => {
          this.cache = {};
        });

        // if this model has caching that depends on other models, also add invalidation for them
        this.cacheDependencies.forEach(databaseRecord => {
          this.database.addChangeHandlerForCollection(databaseRecord, () => {
            this.cache = {};
          });
        });
      }

      // invalidate cached schema for this model on any change to db schema
      this.database.addSchemaChangeHandler(() => {
        this.schemaPromise = this.startSchemaFetch();
        this.fieldNames = null;
      });
    }
  }

  // cache disabled by default. If enabling remember to update the TABLES_REQUIRING_TRIGGER_CREATION to include this table in @tupaia/database/src/runPostMigration.js.
  get cacheEnabled() {
    return false;
  }

  // can be overridden by any subclass that needs cache invalidation when a related table changes
  get cacheDependencies() {
    return [];
  }

  startSchemaFetch = () =>
    this.database.fetchSchemaForTable(this.DatabaseRecordClass.databaseRecord);

  // functionArguments should receive the 'arguments' object
  getCacheKey = (functionName, functionArguments) =>
    `${functionName}:${JSON.stringify(Object.values(functionArguments))}`;

  addChangeHandler = handler =>
    this.database.addChangeHandlerForCollection(this.DatabaseRecordClass.databaseRecord, handler);

  async fetchSchema() {
    return this.schemaPromise;
  }

  /**
   * @returns {Promise<string[]>} fields of the model
   */
  async fetchFieldNames() {
    if (!this.fieldNames) {
      const schema = await this.fetchSchema();

      const customColumnSelectors = this.customColumnSelectors || {};

      this.fieldNames = [
        ...new Set([...Object.keys(schema), ...Object.keys(customColumnSelectors)]),
      ];
    }
    return this.fieldNames;
  }

  /**
   * This method must be overridden by every subclass, so that the model knows what DatabaseRecord to generate when returning results
   * @returns {*} DatabaseRecordClass
   */
  get DatabaseRecordClass() {
    throw new TypeError('get DatabaseRecordClass was called on object that has not implemented it');
  }

  get databaseRecord() {
    return this.DatabaseRecordClass.databaseRecord;
  }

  get joins() {
    return this.DatabaseRecordClass.joins;
  }

  // A helper for the 'xById' methods, which disambiguates the id field to ensure joins are handled
  getIdClause(id) {
    return {
      [this.fullyQualifyColumn('id')]: id,
    };
  }

  // A helper function to ensure that we're using fully qualified column names to avoid ambiguous references when joins are being used
  fullyQualifyColumn(column) {
    if (column.includes('.')) {
      // Already fully qualified
      return column;
    }

    return `${this.databaseRecord}.${column}`;
  }

  async getColumnsForQuery() {
    // Alias field names to the table to prevent errors when joining other tables
    // with same column names.
    const fieldNames = await this.fetchFieldNames();

    return fieldNames.map(fieldName => {
      const qualifiedName = this.fullyQualifyColumn(fieldName);
      const customColumnSelector = this.getColumnSelector(fieldName, qualifiedName);
      if (customColumnSelector) {
        return { [fieldName]: customColumnSelector };
      }
      return qualifiedName;
    });
  }

  async getQueryOptions(customQueryOptions = {}) {
    const options = {};

    options.columns = await this.getColumnsForQuery();

    if (this.joins.length > 0) {
      options.multiJoin = this.joins;

      this.joins.forEach(({ joinWith, joinAs = joinWith, fields: joinFields }) =>
        Object.keys(joinFields).forEach(fieldName =>
          options.columns.push(`${joinAs}.${fieldName} as ${joinFields[fieldName]}`),
        ),
      );
    }

    return { ...options, ...customQueryOptions };
  }

  getColumnSelector(fieldName, qualifiedName) {
    const customSelector = this.customColumnSelectors?.[fieldName];
    return typeof customSelector === 'function' ? customSelector(qualifiedName) : null;
  }

  async getDbConditions(dbConditions = {}) {
    const fieldNames = await this.fetchFieldNames();
    const fullyQualifiedConditions = {};

    const whereClauses = Object.entries(dbConditions);
    for (let i = 0; i < whereClauses.length; i++) {
      const [field, value] = whereClauses[i];
      if (field === QUERY_CONJUNCTIONS.AND || field === QUERY_CONJUNCTIONS.OR) {
        // Recursively proccess AND and OR conditions
        fullyQualifiedConditions[field] = await this.getDbConditions(value);
      } else if (field === QUERY_CONJUNCTIONS.RAW) {
        // Don't touch RAW conditions
        fullyQualifiedConditions[field] = value;
      } else {
        const qualifiedName = this.fullyQualifyColumn(field);
        const customSelector = this.getColumnSelector(field, qualifiedName);
        let fieldSelector = qualifiedName;
        // if there is a custom selector, and it is a string, use it as the field selector. In some cases it will be an object, e.g. `castAs: 'text'` which is used to cast the field to a specific type, but this is not used as the field selector as an error will be thrown.
        if (customSelector && typeof customSelector === 'string') {
          fieldSelector = customSelector;
        }

        const fullyQualifiedField = fieldNames.includes(field) ? fieldSelector : field;
        fullyQualifiedConditions[fullyQualifiedField] = value;
      }
    }

    return fullyQualifiedConditions;
  }

  /**
   * @param  {...any} args
   * @returns {Promise<number>} Count of records matching args
   */
  async count(...args) {
    return this.database.count(this.databaseRecord, ...args);
  }

  async findById(id, customQueryOptions = {}) {
    if (!id) {
      throw new Error(`Cannot search for ${this.databaseRecord} by id without providing an id`);
    }
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    const result = await this.findOne(this.getIdClause(id), queryOptions);
    if (!result) return null;
    return this.generateInstance(result);
  }

  async findByIdOrThrow(
    id,
    customQueryOptions = {},
    message = `No ${this.databaseRecord} found with ID ${id}`,
  ) {
    return ensure(await this.findById(id, customQueryOptions), message);
  }

  async findManyByColumn(column, values, additionalConditions = {}, customQueryOptions = {}) {
    if (!values) {
      throw new Error(
        `Cannot search for ${this.databaseRecord} by ${column} without providing the values`,
      );
    }
    return runDatabaseFunctionInBatches(values, async batchOfValues =>
      this.find({ [column]: batchOfValues, ...additionalConditions }, customQueryOptions),
    );
  }

  async findManyById(ids) {
    return this.findManyByColumn('id', ids);
  }

  async findOne(dbConditions, customQueryOptions = {}) {
    const [queryOptions, processedDbConditions] = await Promise.all([
      this.getQueryOptions(customQueryOptions),
      this.getDbConditions(dbConditions),
    ]);
    const result = await this.database.findOne(
      this.databaseRecord,
      processedDbConditions,
      queryOptions,
    );
    if (!result) return null;
    return this.generateInstance(result);
  }

  /**
   * Finds all records matching query conditions
   * @param {*} dbConditions
   * @param {*} customQueryOptions
   * @returns {Promise<any[]>}
   */
  async find(dbConditions, customQueryOptions = {}) {
    const [queryOptions, processedDbConditions] = await Promise.all([
      this.getQueryOptions(customQueryOptions),
      this.getDbConditions(dbConditions),
    ]);

    const dbResults = await this.database.find(
      this.databaseRecord,
      processedDbConditions,
      queryOptions,
    );
    return Promise.all(dbResults.map(this.generateInstance));
  }

  async findOrCreate(where, extraFieldsIfCreating = {}) {
    const record = await this.findOne(where);
    return record || this.create({ ...where, ...extraFieldsIfCreating });
  }

  async findIdByField(field, fieldValues) {
    const containFields = await this.checkFieldNamesExist([field, 'id']);
    if (!containFields) {
      throw new Error(`${this.databaseRecord} table does not have ${field} or id column`);
    }
    const records = await this.find({ [field]: fieldValues });
    return reduceToDictionary(records, field, 'id');
  }

  async findIdByCode(codes) {
    return this.findIdByField('code', codes);
  }

  async checkFieldNamesExist(fields) {
    const fieldNames = await this.fetchFieldNames();
    return fields.every(field => fieldNames.includes(field));
  }

  async all(customQueryOptions = {}) {
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    return this.find({}, queryOptions);
  }

  /**
   * @returns {*} DatabaseRecordClass
   */
  generateInstance = async (fields = {}) => {
    const data = {};

    // add values for standard fields
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(fieldName => {
      data[fieldName] = fields[fieldName];
    });

    // add values for joined fields
    this.joins.forEach(({ fields: joinFields }) => {
      Object.values(joinFields).forEach(fieldName => {
        data[fieldName] = fields[fieldName];
      });
    });

    return this.createRecordInstance(data);
  };

  /**
   * @returns {*} DatabaseRecordClass
   */
  createRecordInstance = (data = {}) => {
    return new this.DatabaseRecordClass(this, data);
  };

  // Read the field values and convert them to database friendly representations
  // ready to save to the record.
  getDatabaseSafeData = async fieldValues => {
    const data = {};
    const schema = await this.fetchSchema();
    Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
      const value = fieldValues[fieldName];
      // TODO needs investigating why we can't send undefined through
      if (value !== undefined) {
        data[fieldName] = value;
      }

      // Sanitize JSON and JSONB mutations where the base is an array
      // See https://knexjs.org/#Schema-json
      if (['json', 'jsonb'].includes(fieldConfig.type) && Array.isArray(value)) {
        data[fieldName] = JSON.stringify(value);
      }
    });
    return data;
  };

  async create(fields) {
    const data = await this.getDatabaseSafeData(fields);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    const fieldValues = await this.database.create(this.databaseRecord, data);

    return this.generateInstance(fieldValues);
  }

  /**
   * Bulk creates database records and returns DatabaseRecord instances representing them
   * @param {Array.<Object>} recordsToCreate
   */
  async createMany(recordsToCreate) {
    const data = await Promise.all(recordsToCreate.map(this.getDatabaseSafeData));
    const instances = await Promise.all(data.map(this.generateInstance));
    await Promise.all(instances.map(i => i.assertValid()));
    const records = await this.database.createMany(this.databaseRecord, data);
    return Promise.all(records.map(this.generateInstance));
  }

  async delete(whereConditions) {
    if (!whereConditions) {
      throw new DatabaseError('cannot delete model with no conditions');
    }

    return this.database.delete(this.databaseRecord, whereConditions);
  }

  async deleteById(id) {
    return this.delete(this.getIdClause(id));
  }

  /**
   * Updates all records that match the criteria to have the values in fieldsToUpdate
   * @param {object} whereCondition Records matching this criteria will be updated
   * @param {object} fieldsToUpdate  The new values that should be in the record
   */
  async update(whereCondition, fieldsToUpdate) {
    const data = await this.getDatabaseSafeData(fieldsToUpdate);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    return this.database.update(this.databaseRecord, whereCondition, data);
  }

  async updateOrCreate(whereCondition, fieldsToUpsert) {
    const data = await this.getDatabaseSafeData(fieldsToUpsert);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    const fieldValues = await this.database.updateOrCreate(
      this.databaseRecord,
      whereCondition,
      data,
    );
    return this.generateInstance(fieldValues);
  }

  async updateById(id, fieldsToUpdate) {
    return this.update(this.getIdClause(id), fieldsToUpdate);
  }

  markRecordsAsChanged(records) {
    return this.database.markRecordsAsChanged(this.databaseRecord, records);
  }

  async markAsChanged(...args) {
    return this.database.markAsChanged(this.databaseRecord, ...args);
  }

  runCachedFunction(cacheKey, fn) {
    if (!this.cacheEnabled) {
      throw new Error(
        `Must enable caching in the ${this.databaseRecord} model in order to use cached function`,
      );
    }

    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = fn(); // may be async, in which case we cache the promise to be awaited
    }
    return this.cache[cacheKey];
  }
}
