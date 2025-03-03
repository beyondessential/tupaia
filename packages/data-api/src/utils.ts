export const sanitizeMetadataValue = (value: string, type: string) => {
  switch (type) {
    case 'Number': {
      const sanitizedValue = Number.parseFloat(value);
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
    case 'Arithmetic':
    case 'Number': {
      const sanitizedValue = Number.parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    default:
      return value;
  }
};
