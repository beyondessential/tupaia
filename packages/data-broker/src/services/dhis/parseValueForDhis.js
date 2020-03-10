/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { formatDateForDHIS2 } from './formatDateForDHIS2';

// data element value types, taken from https://docs.dhis2.org/2.33/en/developer/html/dhis2_developer_manual_full.html#webapi_csv_data_elements
const INTEGER = 'INTEGER';
const NUMBER = 'NUMBER';
const UNIT_INTERVAL = 'UNIT_INTERVAL';
const PERCENTAGE = 'PERCENTAGE';
const INTEGER_POSITIVE = 'INTEGER_POSITIVE';
const INTEGER_NEGATIVE = 'INTEGER_NEGATIVE';
const INTEGER_ZERO_OR_POSITIVE = 'INTEGER_ZERO_OR_POSITIVE';
const FILE_RESOURCE = 'FILE_RESOURCE';
const COORDINATE = 'COORDINATE';
const TEXT = 'TEXT';
const LONG_TEXT = 'LONG_TEXT';
const LETTER = 'LETTER';
const PHONE_NUMBER = 'PHONE_NUMBER';
const EMAIL = 'EMAIL';
const BOOLEAN = 'BOOLEAN';
const TRUE_ONLY = 'TRUE_ONLY';
const DATE = 'DATE';
const DATETIME = 'DATETIME';

export function parseValueForDhis(value, valueType) {
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
    case DATETIME:
      return formatDateForDHIS2(value);

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
