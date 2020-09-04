/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseError } from '@tupaia/utils';

export class DatabaseModel {
  otherModels = {};

  constructor(database) {
    this.database = database;
    // Add change handler to database if defined, and this is the singleton instance of the model
    const onChange = this.constructor.onChange;
    if (this.database.isSingleton && onChange) {
      this.addChangeHandler(change => onChange(change, this));
    }

    // this.schema contains information about the columns on the table in the database, e.g.:
    // { id: { type: 'text', maxLength: null, nullable: false, defaultValue: null } }
    // it will be populated on the first call to this.fetchSchema(), and should not be accessed
    // directly
    this.schema = null;

    this.cache = {};

    // If this model uses the singleton database, it is probably long running, so be sure to
    // invalidate the cache any time a change is detected. Non-singleton models are those created
    // during transactions, so are short lived and unlikely to need cache invalidation - thus we
    // avoid making an additional connection to pubsub and just leave their cache untouched
    if (this.database.isSingleton) {
      this.database.addChangeHandlerForCollection(this.DatabaseTypeClass.databaseType, () => {
        this.cache = {}; // invalidate cache on any change
      });
      this.database.addSchemaChangeHandler(() => {
        // invalidate cached schema for this model on any change to db schema
        this.schema = null;
        this.fieldNames = null;
      });
    }
  }

  addChangeHandler = handler =>
    this.database.addChangeHandlerForCollection(this.DatabaseTypeClass.databaseType, handler);

  async fetchSchema() {
    if (!this.schema) {
      this.schema = await this.database.fetchSchemaForTable(this.DatabaseTypeClass.databaseType);
    }
    return this.schema;
  }

  async fetchFieldNames() {
    if (!this.fieldNames) {
      const schema = await this.fetchSchema();
      this.fieldNames = Object.keys(schema);
    }
    return this.fieldNames;
  }

  // This method must be overridden by every subclass, so that the model knows what DatabaseType to
  // generate when returning results
  get DatabaseTypeClass() {
    throw new TypeError('get DatabaseTypeClass was called on object that has not implemented it');
  }

  get databaseType() {
    return this.DatabaseTypeClass.databaseType;
  }

  get joins() {
    return this.DatabaseTypeClass.joins;
  }

  // A helper for the 'xById' methods, which disambiguates the id field to ensure joins are handled
  getIdClause(id) {
    return {
      [`${this.databaseType}.id`]: id,
    };
  }

  async getQueryOptions(customQueryOptions = {}) {
    const options = {};

    // Alias field names to the table to prevent errors when joining other tables
    // with same column names.
    const fieldNames = await this.fetchFieldNames();
    options.columns = fieldNames.map(fieldName => {
      return `${this.databaseType}.${fieldName}`;
    });

    if (this.joins.length > 0) {
      options.multiJoin = this.joins;

      this.joins.forEach(({ joinWith, fields: joinFields }) =>
        Object.keys(joinFields).forEach(fieldName =>
          options.columns.push(`${joinWith}.${fieldName} as ${joinFields[fieldName]}`),
        ),
      );
    }

    return { ...options, ...customQueryOptions };
  }

  async count(...args) {
    return this.database.count(this.databaseType, ...args);
  }

  async findById(id, customQueryOptions = {}) {
    if (!id) {
      throw new Error(`Cannot search for ${this.databaseType} by id without providing an id`);
    }
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    const result = await this.findOne(this.getIdClause(id), queryOptions);
    if (!result) return null;
    return this.generateInstance(result);
  }

  async findManyById(ids, criteria = {}) {
    if (!ids) {
      throw new Error(`Cannot search for ${this.databaseType} by id without providing the ids`);
    }
    const records = [];
    const batchSize = this.database.maxBindingsPerQuery;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchOfIds = ids.slice(i, i + batchSize);
      const batchOfRecords = await this.find({ id: batchOfIds, ...criteria });
      records.push(...batchOfRecords);
    }
    return records;
  }

  async findOne(dbConditions, customQueryOptions = {}) {
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    const result = await this.database.findOne(this.databaseType, dbConditions, queryOptions);
    if (!result) return null;
    return this.generateInstance(result);
  }

  async find(dbConditions, customQueryOptions = {}) {
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    const dbResults = await this.database.find(this.databaseType, dbConditions, queryOptions);
    return Promise.all(dbResults.map(result => this.generateInstance(result)));
  }

  async findOrCreate(where, extraFieldsIfCreating = {}) {
    const record = await this.findOne(where);
    return record || this.create({ ...where, ...extraFieldsIfCreating });
  }

  async all(customQueryOptions = {}) {
    const queryOptions = await this.getQueryOptions(customQueryOptions);
    return this.find({}, queryOptions);
  }

  /**
   * Run some custom sql that returns records of the correct database type, and generate
   * DatabaseType instances for each record. Handy if filtering by a join table etc.
   * @param {string}      sql               Must return records with all the expected fields, e.g. SELECT entity.* FROM entity ...
   * @param {[string[]]}  parametersToBind  Parameters to safely substitute for `?` in the sql string
   */
  async findWithSql(sql, parametersToBind) {
    const records = await this.database.executeSql(sql, parametersToBind);
    return Promise.all(records.map(this.generateInstance));
  }

  generateInstance = async (fields = {}) => {
    const data = await this.getDatabaseSafeData(fields);
    this.joins.forEach(({ fields: joinFields }) => {
      Object.values(joinFields).forEach(fieldName => {
        data[fieldName] = fields[fieldName];
      });
    });

    return new this.DatabaseTypeClass(this, data);
  };

  // Read the field values and convert them to database friendly representations
  // ready to save to the record.
  getDatabaseSafeData = async fieldValues => {
    const data = {};
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(fieldName => {
      const value = fieldValues[fieldName];
      // TODO needs investigating why we can't send undefined through
      if (value !== undefined) {
        data[fieldName] = value;
      }
    });
    return data;
  };

  async create(fields) {
    const data = await this.getDatabaseSafeData(fields);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    const fieldValues = await this.database.create(this.databaseType, data);

    return this.generateInstance(fieldValues);
  }

  /**
   * Bulk creates database records and returns DatabaseType instances representing them
   * @param {Array.<Object>} recordsToCreate
   */
  async createMany(recordsToCreate) {
    const data = await Promise.all(recordsToCreate.map(this.getDatabaseSafeData));
    const instances = await Promise.all(data.map(this.generateInstance));
    await Promise.all(instances.map(i => i.assertValid()));
    const records = await this.database.createMany(this.databaseType, data);
    return Promise.all(records.map(this.generateInstance));
  }

  async delete(whereConditions) {
    if (!whereConditions) {
      throw new DatabaseError('cannot delete model with no conditions');
    }

    return this.database.delete(this.databaseType, whereConditions);
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
    return this.database.update(this.databaseType, whereCondition, data);
  }

  async updateOrCreate(whereCondition, fieldsToUpsert) {
    const data = await this.getDatabaseSafeData(fieldsToUpsert);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    const fieldValues = await this.database.updateOrCreate(this.databaseType, whereCondition, data);
    return this.generateInstance(fieldValues);
  }

  async updateById(id, fieldsToUpdate) {
    return this.update(this.getIdClause(id), fieldsToUpdate);
  }

  markRecordsAsChanged(records) {
    return this.database.markRecordsAsChanged(this.databaseType, records);
  }

  async markAsChanged(...args) {
    return this.database.markAsChanged(this.databaseType, ...args);
  }

  runCachedFunction(cacheKey, fn) {
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = fn(); // may be async, in which case we cache the promise to be awaited
    }
    return this.cache[cacheKey];
  }
}
