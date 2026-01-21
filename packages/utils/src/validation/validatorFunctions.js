import moment from 'moment';
import validator from 'validator';

import { toArray } from '../array';
import { ValidationError } from '../errors';
import { checkIsOfType, getTypeWithArticle, stringifyValue } from './validationTypes';

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
    throw new ValidationError(`Expected nonempty value but got ${stringifyValue(value)}`);
  }
  return true;
};

export const hasNoContent = value => {
  if (value || value === 0) {
    // A `0` is still content, so should also fail
    throw new ValidationError(`Expected empty value but got ${stringifyValue(value)}`);
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

export const isBoolean = value => {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`Should contain a boolean instead of ${stringifyValue(value)}`);
  }
};

export const isAString = value => {
  if (typeof value !== 'string') {
    throw new ValidationError(`Should contain a string instead of ${value}`);
  }
};

export const isArray = value => {
  if (!Array.isArray(value)) {
    throw new ValidationError(`Should contain an array instead of ${stringifyValue(value)}`);
  }
};

export const hasNoAlphaLetters = value => {
  if (value.toString().match(/[a-zA-Z]/g)) {
    throw new ValidationError('Should not contain any alpha letters');
  }
};

export const isHexColor = value => {
  if (!validator.isHexColor(value.toString())) {
    // Coerce to string before checking with validator
    throw new ValidationError('Not a valid hex colour');
  }
};

export const isURL = value => {
  if (!validator.isURL(value.toString())) {
    // Coerce to string before checking with validator
    throw new ValidationError('Not a valid url');
  }
};

export const isURLPathSegment = value => {
  const urlSegmentRegex = /^[a-zA-Z0-9_-]+$/;
  if (!urlSegmentRegex.test(value.toString())) {
    throw new ValidationError('No a valid url segment');
  }
};

export const isPlainObject = value => {
  if (!checkIsOfType(value, 'object')) {
    throw new Error('Not a plain javascript object');
  }
};

const constructAllValuesAreOfType = type => object => {
  Object.entries(object).forEach(([key, value]) => {
    // eslint-disable-next-line valid-typeof
    if (typeof value !== type) {
      const typeDescription = getTypeWithArticle(type);
      throw new ValidationError(
        `Value '${key}' is not ${typeDescription}: ${stringifyValue(value)}`,
      );
    }
  });
};

export const allValuesAreNumbers = constructAllValuesAreOfType('number');

export const fieldHasContent = value => {
  if (value === undefined || value === null || value.length === 0) {
    throw new ValidationError('Please complete all fields.');
  }
  return true;
};

export const isValidPassword = password => {
  try {
    hasContent(password);
    constructIsLongerThan(7)(password);
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
    throw new ValidationError(
      `${value} is not an accepted value.`,
      `Accepted values: "${options.join('", "')}"`,
    );
  }
};

export const constructIsOneOfType = types => {
  if (!Array.isArray(types)) {
    throw new Error('constructIsOneOfType expects an array of types');
  }
  if (types.length === 0) {
    throw new Error('constructIsOneOfType expects at least one type');
  }

  return value => {
    if (!types.some(type => checkIsOfType(value, type))) {
      throw new Error(`Must be one of ${types.join(' | ')}`);
    }
  };
};

export const constructIsSubSetOf = options => arrayValue => {
  if (!Array.isArray(arrayValue)) {
    throw new Error('constructIsSubSetOf expects an array of values');
  }

  if (!Array.isArray(options)) {
    throw new Error('constructIsSubSetOf expects an array of options');
  }

  const isSubSet = arrayValue.every(v => options.includes(v));

  if (!isSubSet) {
    throw new Error(`Some values of '${arrayValue.toString}' are not included in '${options}'`);
  }
};

export const constructIsArrayOf = type => value => {
  isArray(value);
  Object.values(value).forEach(item => {
    if (!checkIsOfType(item, type)) {
      const typeDescription = getTypeWithArticle(type);
      throw new ValidationError(`${stringifyValue(item)} is not ${typeDescription}`);
    }
  });
};

export const constructRecordExistsWithField = (model, field) => async value => {
  hasContent(value);

  const record = await model.findOne({ [field]: value });
  if (!record) {
    throw new ValidationError(`No ${model.databaseRecord} with ${field}: ${value}`);
  }
};

export const constructRecordNotExistsWithField =
  (model, field = 'code') =>
  async value => {
    hasContent(value);

    const record = await model.findOne({ [field]: value });
    if (record) {
      throw new ValidationError(
        `Another ${model.databaseRecord} record already exists with with ${field}: ${value}`,
      );
    }
  };

export const constructRecordExistsWithCode = model => async value => {
  hasContent(value);

  const record = await model.findOne({ code: value });
  if (!record) {
    throw new ValidationError(`No ${model.databaseRecord} with code ${value}`);
  }
};

/**
 * Can either pass in the specific database model, or the entire database with the record type as
 * the second argument
 * @param {DatabaseModel or TupaiaDatabase} modelOrDatabase
 * @param {string} [recordType] - Provide when using database
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
      throw new ValidationError(`No ${model.databaseRecord} with id ${value}`);
    }
  }
};

/**
 * @param {Function|Function[]} validators
 */
export const constructIsEmptyOr = validators => async (value, object, key) => {
  if (value !== undefined && value !== null && value !== '') {
    const runValidator = async validatorFunction => {
      await validatorFunction(value, object, key);
    };
    await Promise.all(toArray(validators).map(runValidator));
  }
};

/**
 * @param {Function|Function[]} validators
 */
export const constructIsEmptyOrSync = validators => (value, object, key) => {
  if (value !== undefined && value !== null && value !== '') {
    toArray(validators).forEach(validatorFunction => {
      validatorFunction(value, object, key);
    });
  }
};

export const constructIsNotPresentOr = validatorFunction => (value, object, key) => {
  return !object.hasOwnProperty(key) || validatorFunction(value, object, key);
};

export const constructIsLongerThan = minLength => value => {
  if (value.length <= minLength) {
    throw new ValidationError(`Must be longer than ${minLength} characters`);
  }
};

export const constructIsShorterThan = maxLength => value => {
  if (value && value.length >= maxLength) {
    throw new ValidationError(`Must be shorter than ${maxLength} characters`);
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

export const constructEveryItemSync = validatorFunction => value => {
  if (!Array.isArray(value)) {
    throw new Error('Must be an array');
  }

  value.forEach(validatorFunction);
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

export const constructIsValidEntityType = entityModel => async type => {
  const isOneOfEntityTypesValidator = constructIsOneOf(await entityModel.getEntityTypes());
  return isOneOfEntityTypesValidator(type);
};

export const constructIsValidEntityTypes = entityModel => async rawTypes => {
  const types = rawTypes.split(',');
  const isOneOfEntityTypesValidator = constructIsOneOf(await entityModel.getEntityTypes());
  for (let i = 0; i < types.length; i++) {
    const isValidType = isOneOfEntityTypesValidator(types[i]);
    if (!isValidType) {
      return false;
    }
  }
  return true;
};
