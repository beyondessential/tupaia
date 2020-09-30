/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

/* eslint no-underscore-dangle: ['error', { 'allow': ['_database'] }] */

import { DatabaseError } from '@tupaia/utils';

export class BaseModel {
  /**
   * The database table this model links to.
   */
  static databaseType = null;

  /**
   * Fields link to the database and can be in simple form or complex form, eg:
   *
   * static fields = [
   *   'id', // Reads and stores raw id value from database
   *   'name', // Reads and stores raw name value from database
   *   {
   *     type: 'json',
   *     name: 'metadata',
   *   }, // Reads and stores json values from database.
   * ]
   */
  static fields = [];

  /*
    Joins are executed on every model query and give developers the ability to
    add extra fields that are necessary for a model to be meaningful.

    format:
    static joins = [
      {
        fields: {
          ['field code in joined database']: 'field code to map to in model',
        },
        joinWith: 'table to join with',
        joinCondition: [`{table to join with}.id`, `${this.databaseType}.${field to join on}`],
      }
    ]

    eg:
    static joins = [
      {
        fields: {
          code: 'country_code',
        },
        joinWith: TYPES.COUNTRY,
        joinCondition: [`${TYPES.COUNTRY}.id`, `${this.databaseType}.country_id`],
      },
      {
        fields: {
          code: 'foo_bar_field',
        },
        joinWith: TYPES.FOO_BAR,
        joinCondition: [`${TYPES.FOO_BAR}.id`, `${this.databaseType}.foo_bar_id`],
      }
    ]

    Will add the fields `country_code` and `foo_bar_field` to the model using the value
    from the join query.
  */
  static joins = [];

  static functionsPendingDatabaseInjection = [];

  static set database(database) {
    this._database = database;
    this.functionsPendingDatabaseInjection.forEach(fn => fn(database));
  }

  static get database() {
    return this._database;
  }

  // Convenience method for instances of BaseModel to access database
  // without travelling through constructor.
  get database() {
    return this.constructor.database;
  }

  set database(value) {
    throw new Error('should not attempt to re-set model database instance variable');
  }

  /**
   * Run a function immediately if the database is available, or as soon as a database instance is
   * injected
   * @param {function} functionToRun  Takes 'database' as its only argument
   */
  static runWithDatabase(functionToRun) {
    if (this.database) {
      functionToRun(this.database);
    } else {
      // line this up to be run when the database has been injected
      this.functionsPendingDatabaseInjection.push(functionToRun);
    }
  }

  static addChangeHandler(handler) {
    this.runWithDatabase(database =>
      database.addChangeHandlerForCollection(this.databaseType, handler),
    );
  }

  static getQueryOptions(customQueryOptions = {}) {
    const options = {};

    // Alias field names to the table to prevent errors when joining other tables
    // with same column names.
    options.columns = this.fields.map(field => {
      const fieldName = typeof field === 'string' ? field : field.name;
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

  static async findById(id, loadOptions = {}, queryOptions = {}) {
    const result = await this.database.findById(this.databaseType, id, {
      ...this.getQueryOptions(),
      ...queryOptions,
    });
    if (result) {
      return this.load(result, loadOptions);
    }
    return null;
  }

  static async findOne(dbConditions, loadOptions = {}, queryOptions = {}) {
    const result = await this.database.findOne(
      this.databaseType,
      dbConditions,
      this.getQueryOptions(queryOptions),
    );
    if (result) {
      return this.load(result, loadOptions);
    }

    return null;
  }

  static async find(dbConditions, loadOptions = {}, queryOptions = {}) {
    const dbResults = await this.database.find(
      this.databaseType,
      dbConditions,
      this.getQueryOptions(queryOptions),
    );

    const models = dbResults.map(result => this.load(result, loadOptions));
    return models;
  }

  static async all(loadOptions = {}, queryOptions = {}) {
    return this.find({}, loadOptions, this.getQueryOptions(queryOptions));
  }

  static load(fields) {
    const model = new this();

    this.fields.forEach(field => {
      const isSimpleFieldDefinition = typeof field === 'string';
      const fieldName = isSimpleFieldDefinition ? field : field.name;

      model[fieldName] = fields[fieldName];
    });

    this.joins.forEach(({ fields: joinFields }) => {
      Object.values(joinFields).forEach(fieldName => {
        model[fieldName] = fields[fieldName];
      });
    });

    return model;
  }

  // Read the models values and convert them to database friendly representations
  // ready to save to the record.
  static processFieldsForDatabase(fieldValues) {
    const fields = {};

    this.fields.forEach(fieldName => {
      if (fieldValues[fieldName] !== undefined) {
        fields[fieldName] = fieldValues[fieldName];
      }
    });

    return fields;
  }

  // Get the model's values as they correspond to database fields.
  getDatabaseFieldValues() {
    return this.constructor.processFieldsForDatabase(this);
  }

  // Save the current state of this model into the database. Creates a new
  // database entry if no id exists.
  async save() {
    const fieldValues = this.getDatabaseFieldValues();

    if (this.id) {
      await this.database.update(this.constructor.databaseType, { id: this.id }, fieldValues);
    } else {
      const records = await this.database.create(this.constructor.databaseType, fieldValues);
      this.id = records[0].id;
    }
  }

  static async create(fields, loadOptions = {}) {
    const databaseFields = this.processFieldsForDatabase(fields);
    const modelFields = await this.database.create(this.databaseType, databaseFields);

    const model = this.load(modelFields, loadOptions);
    return model;
  }

  static async delete(whereConditions) {
    if (!whereConditions) {
      throw new DatabaseError('cannot delete model with no conditions');
    }

    return this.database.delete(this.databaseType, whereConditions);
  }

  static async updateOrCreate(whereCondition, fields, loadOptions = {}) {
    const databaseFields = this.processFieldsForDatabase(fields);
    const modelFields = await this.database.updateOrCreate(
      this.databaseType,
      whereCondition,
      databaseFields,
    );

    const model = this.load(modelFields, loadOptions);
    return model;
  }
}
