import { formatDateForDHIS2, formatDateTimeForDHIS2 } from './formatDateForDHIS2';
import {
  INTEGER,
  NUMBER,
  UNIT_INTERVAL,
  PERCENTAGE,
  INTEGER_POSITIVE,
  INTEGER_NEGATIVE,
  INTEGER_ZERO_OR_POSITIVE,
  FILE_RESOURCE,
  COORDINATE,
  TEXT,
  LONG_TEXT,
  LETTER,
  PHONE_NUMBER,
  EMAIL,
  BOOLEAN,
  TRUE_ONLY,
  DATE,
  DATETIME,
} from '../dhisValueTypes';
import { ValueType } from '../types';

export function parseValueForDhis(value: string, valueType: ValueType) {
  switch (valueType) {
    // numbers
    case INTEGER:
    case NUMBER:
    case UNIT_INTERVAL:
    case PERCENTAGE:
    case INTEGER_POSITIVE:
    case INTEGER_NEGATIVE:
    case INTEGER_ZERO_OR_POSITIVE:
      // handle special case where a binary/checkbox question is sent to a number data element
      // in future, this should be removed
      if (value === 'Yes') return '1';
      if (value === 'No') return '0';
      return parseFloat(value).toString();

    // booleans
    case BOOLEAN:
    case TRUE_ONLY:
      if (value === 'Yes') return '1';
      if (value === 'No') return '0';
      throw new Error(`Unsupported boolean value "${value}"`);

    // dates
    case DATE:
      return formatDateForDHIS2(value);
    case DATETIME:
      return formatDateTimeForDHIS2(value);

    // plain text
    case TEXT:
    case LONG_TEXT:
    case PHONE_NUMBER:
    case EMAIL:
      return value;

    // unsupported
    default:
    case FILE_RESOURCE:
    case LETTER:
    case COORDINATE:
      throw new Error(`Unsupported data element type ${valueType}`);
  }
}
