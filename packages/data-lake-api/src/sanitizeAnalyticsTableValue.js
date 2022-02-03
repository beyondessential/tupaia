/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Analytics table values have already been partially sanitized
 * see: `build_analytics_table()` database function
 */
export const sanitizeAnalyticsTableValue = (value, type) => {
  switch (type) {
    case 'Binary':
    case 'Checkbox':
    case 'Number': {
      const sanitizedValue = parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    default:
      return value;
  }
};
