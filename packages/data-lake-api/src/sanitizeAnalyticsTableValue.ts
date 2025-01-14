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
