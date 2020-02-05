/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseError } from '@tupaia/utils';

export class DatabaseModel {
  otherModels = {};

  constructor(database, onChange) {
    this.database = database;
    // Add change handler to database if defined (generally for the singleton instance of a model)
    if (onChange) {
      this.database.addChangeHandlerForCollection(
        this.DatabaseTypeClass.databaseType,
        (change, record) => onChange(change, record, this),
      );
    }

    // this.schema contains information about the columns on the table in the database, e.g.:
    // { id: { type: 'text', maxLength: null, nullable: false, defaultValue: null } }
    // it will be populated on the first call to this.fetchSchema(), and should not be accessed
    // directly
    this.schema = null;
  }

  async fetchSchema() {
    if (!this.schema) {
      this.schema = await this.database.fetchSchemaForTable(this.DatabaseTypeClass.databaseType);
    }
    return this.schema;
  }

  async fetchFieldNames() {
    const schema = await this.fetchSchema();
    return Object.keys(schema);
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

  async generateInstance(fields = {}) {
    const data = await this.getDatabaseSafeData(fields);
    this.joins.forEach(({ fields: joinFields }) => {
      Object.values(joinFields).forEach(fieldName => {
        data[fieldName] = fields[fieldName];
      });
    });

    return new this.DatabaseTypeClass(this, data);
  }

  // Read the field values and convert them to database friendly representations
  // ready to save to the record.
  async getDatabaseSafeData(fieldValues) {
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
  }

  async create(fields) {
    const data = await this.getDatabaseSafeData(fields);
    const instance = await this.generateInstance(data);
    await instance.assertValid();
    const fieldValues = await this.database.create(this.databaseType, data);

    return this.generateInstance(fieldValues);
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

  async markAsChanged(...args) {
    return this.database.markAsChanged(this.databaseType, ...args);
  }
}
