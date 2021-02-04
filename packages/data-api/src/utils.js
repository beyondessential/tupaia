/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const sanitizeDataValue = (value, type) => {
  switch (type) {
    case 'Number': {
      const sanitizedValue = parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    case 'Binary':
    case 'Checkbox':
      return value === 'Yes' ? 1 : 0;
    default:
      return value;
  }
};
