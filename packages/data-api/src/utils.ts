/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const sanitizeMetadataValue = (value: string, type: string) => {
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

/**
 * Analytics table values have already been partially sanitized
 * see: `build_analytics_table()` database function
 */
export const sanitizeAnalyticsTableValue = (value: string, type: string) => {
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
