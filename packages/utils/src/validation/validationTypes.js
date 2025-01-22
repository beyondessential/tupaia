import { getArticle } from '../string';

export const VALIDATION_TYPES = {
  ARRAY: 'array',
  OBJECT: 'object',
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  UNDEFINED: 'undefined',
  NULL: 'null',
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
    case VALIDATION_TYPES.NULL:
      return value === null;
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
    case 'number':
      return VALIDATION_TYPES.NUMBER;
    case 'string':
      return VALIDATION_TYPES.STRING;
    case 'boolean':
      return VALIDATION_TYPES.BOOLEAN;
    case 'undefined':
      return VALIDATION_TYPES.UNDEFINED;
    case 'object': {
      if (Array.isArray(value)) {
        return VALIDATION_TYPES.ARRAY;
      }
      if (isPojo(value)) {
        return VALIDATION_TYPES.OBJECT;
      }
      if (value === null) {
        return VALIDATION_TYPES.NULL;
      }
    }
    // fall through
    default:
      throw new Error(`Non supported type: ${typeof value}`);
  }
};

export const stringifyValue = value => {
  switch (getValidationType(value)) {
    case VALIDATION_TYPES.ARRAY:
    case VALIDATION_TYPES.OBJECT:
      return JSON.stringify(value);
    case VALIDATION_TYPES.STRING:
      return `'${value}'`;
    default:
      return value;
  }
};

export const strictJsonParseValue = value => {
  const o = JSON.parse(value);
  // JSON.parse(null) returns null, and typeof null === "object"
  if (typeof o === 'object' && o) {
    return o;
  }
  throw new Error('JSON parse failed, result is not an object');
};

export const getTypeWithArticle = type =>
  [VALIDATION_TYPES.UNDEFINED, VALIDATION_TYPES.NULL].includes(type)
    ? type
    : `${getArticle(type)} ${type}`;
