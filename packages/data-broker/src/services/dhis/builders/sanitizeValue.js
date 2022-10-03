/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { NUMBER } from '../dhisValueTypes';

/**
 * @param {number|string} value
 * @param {string} valueType
 * @returns {number|string}
 */
export const sanitizeValue = (value, valueType) => {
  if (valueType === NUMBER) {
    const sanitizedValue = parseFloat(value);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
