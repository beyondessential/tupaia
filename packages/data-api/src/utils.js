/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const sanitizeDataValue = (value, type) => {
  if (type === 'Number') {
    const sanitizedValue = parseFloat(value);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
