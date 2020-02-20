/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @see https://docs.dhis2.org/master/en/developer/html/webapi_csv_metadata_import.html#webapi_csv_data_elements
 */
const VALUE_TYPES = {
  BOOLEAN: 'BOOLEAN',
  COORDINATE: 'COORDINATE',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  EMAIL: 'EMAIL',
  FILE_RESOURCE: 'FILE_RESOURCE',
  INTEGER: 'INTEGER',
  INTEGER_NEGATIVE: 'INTEGER_NEGATIVE',
  INTEGER_POSITIVE: 'INTEGER_POSITIVE',
  INTEGER_ZERO_OR_POSITIVE: 'INTEGER_ZERO_OR_POSITIVE',
  LETTER: 'LETTER',
  LONG_TEXT: 'LONG_TEXT',
  NUMBER: 'NUMBER',
  PERCENTAGE: 'PERCENTAGE',
  PHONE_NUMBER: 'PHONE_NUMBER',
  TEXT: 'TEXT',
  TRUE_ONLY: 'TRUE_ONLY',
  UNIT_INTERVAL: 'UNIT_INTERVAL',
};

/**
 * @param {number|string} value
 * @param {string} valueType
 * @returns {number|string}
 */
export const sanitizeValue = (value, valueType) => {
  if (valueType === VALUE_TYPES.NUMBER) {
    const sanitizedValue = parseFloat(value);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
