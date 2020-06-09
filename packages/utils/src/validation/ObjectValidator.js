/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '../errors';

/**
 * Allows a series of 'validator' functions to be run, e.g., across each row in an import file. The
 * object passed in through the constructor should contain an array for each field in the object,
 * containing functions that take in the value in that field for a given object and throw an error
 * if it is not valid
 */
export class ObjectValidator {
  constructor(fieldValidators, defaultValidators) {
    this.fieldValidators = fieldValidators;
    this.defaultValidators = defaultValidators;
  }

  /**
   *
   * @param {object}    object          The object to be validated
   * @param {function}  constructError  An optional function to construct a custom error
   */
  async validate(object, constructError) {
    // Go through each of the fields we have explicit validators for, and run the validators
    for (const [fieldKey, currentFieldValidators] of Object.entries(this.fieldValidators)) {
      await runValidators(currentFieldValidators, object, fieldKey, constructError);
    }
    if (this.defaultValidators) {
      // Go through each of the fields in the object we don't have explicit validators for, and run
      // the default validator
      for (const fieldKey of Object.keys(object)) {
        if (!this.fieldValidators[fieldKey] || this.fieldValidators[fieldKey].length === 0) {
          await runValidators(this.defaultValidators, object, fieldKey, constructError);
        }
      }
    }
  }
}

async function runValidators(validators, object, fieldKey, constructError) {
  for (let j = 0; j < validators.length; j++) {
    try {
      await validators[j](object[fieldKey], object, fieldKey); // Throws an error if not valid
    } catch (error) {
      throw constructError
        ? constructError(error.message, fieldKey)
        : new ValidationError(
            `Invalid content for field "${fieldKey}" causing message "${error.message}"`,
          );
    }
  }
}
