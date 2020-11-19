/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getArticle } from '../string';

export const VALIDATION_TYPES = {
  ARRAY: 'array',
  OBJECT: 'object',
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  UNDEFINED: 'undefined',
};

// Conditional taken from https://github.com/bttmly/is-pojo/blob/master/lib/index.js
const isPojo = value =>
  value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;

export const checkIsOfType = (value, type) => {
  switch (type) {
    case VALIDATION_TYPES.ARRAY:
      return Array.isArray(value);
    case VALIDATION_TYPES.OBJECT:
      return isPojo(value);
    case VALIDATION_TYPES.NUMBER:
    case VALIDATION_TYPES.STRING:
    case VALIDATION_TYPES.BOOLEAN:
    case VALIDATION_TYPES.UNDEFINED:
      // eslint-disable-next-line valid-typeof
      return typeof value === type;
    default:
      throw new Error(`Non supported type: ${type}`);
  }
};

const getValidationType = value => {
  switch (typeof value) {
    case 'object':
      return Array.isArray(value) ? VALIDATION_TYPES.ARRAY : VALIDATION_TYPES.OBJECT;
    case 'number':
      return VALIDATION_TYPES.NUMBER;
    case 'string':
      return VALIDATION_TYPES.STRING;
    case 'boolean':
      return VALIDATION_TYPES.BOOLEAN;
    case 'undefined':
      return VALIDATION_TYPES.UNDEFINED;
    default:
      throw new Error(`Non supported type: ${typeof value}`);
  }
};

export const stringifyValue = value => {
  switch (getValidationType(value)) {
    case VALIDATION_TYPES.NUMBER:
    case VALIDATION_TYPES.BOOLEAN:
    case VALIDATION_TYPES.UNDEFINED:
      return value;
    case VALIDATION_TYPES.STRING:
      return `'${value}'`;
    default:
      return JSON.stringify(value);
  }
};

export const getTypeWithArticle = type =>
  type === VALIDATION_TYPES.UNDEFINED ? type : `${getArticle(type)} ${type}`;
