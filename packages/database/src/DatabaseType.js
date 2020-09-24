/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TypeValidationError } from '@tupaia/utils';

export class DatabaseType {
  static databaseType = null; // The database table name

  /**
   * The field validator is a map with a type field as the key and
   * an array of validator functions to run on said field as the value.
   * Each validator function should return true if the field passes the condition
   * or an error message as a string if not. The validator will fail if anything other
   * than true is returned.
   * -- i.e. be careful to return only an error string or true bool,
   * -- or the user will get an error with no message.
   *
   * Each validator function is passed both the field value attempting to be inserted
   * and the entire DatabaseModel object, you can use none, one or all of these in the validators.
   *
   * static fieldValidators = new Map()
   *   .set('field', [
   *     (field) => hasContent(field) // generic func to return true if field has content or error message if not
   *     (field, model) => { // custom validator function using the model
   *       if (model.otherValue > field) {
   *         return "other value can't be bigger than field.";
   *       }
   *       return true;
   *     }
   *   ])
   *   .set('anotherField', [ (field) => !field && "field cannot be null or undefined" ]);
   */
  static fieldValidators = new Map();

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

  constructor(model, fieldValues) {
    this.model = model;
    Object.entries(fieldValues).forEach(([fieldName, fieldValue]) => {
      this[fieldName] = fieldValue;
    });
  }

  get databaseType() {
    return this.constructor.databaseType;
  }

  get database() {
    return this.model.database;
  }

  get otherModels() {
    return this.model.otherModels;
  }

  // Return an object representing just the data for returning through http requests etc.
  async getData() {
    const data = {};
    const schema = await this.model.fetchSchema();
    Object.keys(schema).forEach(fieldName => {
      data[fieldName] = this[fieldName];
    });
    return data;
  }

  // Takes a map with a field as the keys and array of validator functions to run
  // on said field as the values. Will throw an error if the any validator function
  // returns anything other than true.
  async assertValid() {
    const { fieldValidators } = this.constructor;

    if (fieldValidators.size < 1) return true; // no validators to run.

    const runFieldValidator = async ([field, validations]) => {
      const resultTasks = validations.map(check => check(this[field], this));
      const results = await Promise.all(resultTasks);
      return {
        field,
        errors: results.filter(x => x), // remove validations returning null (no error)
      };
    };

    // Map.entries returns an Array-like iterator that can't be mapped,
    // we are destructuring it into an array here so we can use map.
    const fieldTasks = [...fieldValidators.entries()].map(runFieldValidator);

    const fieldResults = await Promise.all(fieldTasks);
    const problematicFields = fieldResults.filter(r => r.errors.length > 0);

    if (problematicFields.length > 0) {
      throw new TypeValidationError(problematicFields, this.databaseType);
    }
  }

  // Save the current state of this instance into the database. Creates a new
  // database entry if no id exists.
  async save() {
    const data = await this.getData();
    if (this.id) {
      await this.model.updateById(this.id, data);
    } else {
      const record = await this.model.create(data);
      this.id = record.id;
    }
  }
}
