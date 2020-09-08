/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import validator from 'validator';
import { ValidationError } from '../errors';

const checkIsEmpty = value => value === undefined || value === null || value.length === 0;

export const isPresent = value => {
  if (value === undefined) {
    throw new ValidationError(
      'Even if it has no content, the field should be included in the object',
    );
  }
};

export const isNotPresent = (value, object, key) => {
  if (object.hasOwnProperty(key)) {
    throw new ValidationError('Invalid field');
  }
  return true;
};

export const hasContent = value => {
  if (checkIsEmpty(value)) {
    throw new ValidationError('Should not be empty');
  }
  return true;
};

export const hasNoContent = value => {
  if (value || value === 0) {
    // A `0` is still content, so should also fail
    throw new ValidationError('Should be empty');
  }
  return true;
};

export const takesIdForm = value => {
  if (value.length !== 24) {
    throw new ValidationError('An id should be 24 characters exactly');
  }
};

export const takesDateForm = value => {
  if (!moment(value, moment.ISO_8601, true).isValid()) {
    throw new ValidationError('Dates should be in ISO 8601 format');
  }
};

export const isNumber = value => {
  if (isNaN(value)) {
    throw new ValidationError(`Should contain a number instead of ${value}`);
  }
};

export const isAString = value => {
  if (typeof value !== 'string') {
    throw new ValidationError(`Should contain a string instead of ${value}`);
  }
};

export const hasNoAlphaLetters = value => {
  if (value.toString().match(/[a-zA-Z]/g)) {
    throw new ValidationError('Should not contain any alpha letters');
  }
};

export const isEmail = value => {
  if (!validator.isEmail(value.toString())) {
    // Coerce to string before checking with validator
    throw new ValidationError('Not a valid email address');
  }
};

export const isPlainObject = value => {
  // Conditional taken from https://github.com/bttmly/is-pojo/blob/master/lib/index.js
  const isPojo =
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype;
  if (!isPojo) {
    throw new Error('Not a plain javascript object');
  }
};

export const allValuesAreNumbers = object => {
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value !== 'number') {
      throw new ValidationError(`Value '${key}' is not a number: '${value}'`);
    }
  });
};

export const fieldHasContent = value => {
  if (value === undefined || value === null || value.length === 0) {
    throw new ValidationError('Please complete all fields.');
  }
  return true;
};

export const isValidPassword = password => {
  try {
    hasContent(password);
    constructIsLongerThan(8)(password);
  } catch (error) {
    throw new ValidationError('Password must be over 8 characters long.');
  }
  return true;
};

/**
 * Unlike the other validator functions, the constructors below this point take in extra information
 * and return the validation function
 */

export const constructIsOneOf = options => value => {
  if (!options.includes(value)) {
    throw new ValidationError(`${value} is not an accepted value`);
  }
};

export const constructRecordExistsWithCode = model => async value => {
  hasContent(value);

  const record = await model.findOne({ code: value });
  if (!record) {
    throw new ValidationError(`No ${model.databaseType} with code ${value}`);
  }
};

/**
 * Can either pass in the specific database model, or the entire database with the record type as
 * the second argument
 * @param {DatabaseModel or TupaiaDatabase} modelOrDatabase
 * @param {string}                          recordType        Provide when using database
 */
export const constructRecordExistsWithId = (modelOrDatabase, recordType) => async value => {
  hasContent(value);
  takesIdForm(value);
  if (recordType) {
    // Calling with database and recordType
    const database = modelOrDatabase;
    const record = await database.findById(recordType, value);
    if (!record) {
      throw new ValidationError(`No ${recordType} with id ${value}`);
    }
  } else {
    // Calling with just the specific model to use
    const model = modelOrDatabase;
    const record = await model.findById(value);
    if (!record) {
      throw new ValidationError(`No ${model.databaseType} with id ${value}`);
    }
  }
};

export const constructIsEmptyOr = validatorFunction => (value, object, key) => {
  if (value !== undefined && value !== null && value !== '') {
    return validatorFunction(value, object, key);
  }
  return true;
};

export const constructIsNotPresentOr = validatorFunction => (value, object, key) => {
  return !object.hasOwnProperty(key) || validatorFunction(value, object, key);
};

export const constructIsLongerThan = minLength => value => {
  if (value.length < minLength) {
    throw new ValidationError(`Must be longer than ${value} characters`);
  }
};

export const constructIsValidJson = () => value => {
  try {
    JSON.parse(value);
  } catch (exception) {
    throw new ValidationError(`${value} is not valid JSON`);
  }
};

export const constructEveryItem = validatorFunction => async value => {
  if (!Array.isArray(value)) {
    throw new Error('Must be an array');
  }

  await Promise.all(value.map(validatorFunction));
  return true;
};

export const constructAtMostOneItem = booleanTest => async value => {
  if (!Array.isArray(value)) {
    throw new Error('Must be an array');
  }

  let count = 0;
  for (let i = 0; i < value.length; i++) {
    const result = await booleanTest(value[i]);
    if (result) {
      count++;
    }

    if (count > 1) {
      throw new Error('More than one item fulfils the given condition');
    }
  }

  return true;
};

export const constructThisOrThatHasContent = otherFieldKey => (value, object) => {
  if (checkIsEmpty(value) && checkIsEmpty(object[otherFieldKey])) {
    // neither have content, throw error
    throw new Error(`Either this field or ${otherFieldKey} must be defined`);
  }
  return true;
};
