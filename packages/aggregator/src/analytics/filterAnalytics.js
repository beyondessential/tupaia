const FILTER_TYPE_TO_METHOD = {
  // eslint-disable-next-line eqeqeq
  '=': (analytic, filterValue, filterProperty) => analytic[filterProperty] == filterValue,
  '>': (analytic, filterValue, filterProperty) => analytic[filterProperty] > filterValue,
  '>=': (analytic, filterValue, filterProperty) => analytic[filterProperty] >= filterValue,
  '<': (analytic, filterValue, filterProperty) => analytic[filterProperty] < filterValue,
  '<=': (analytic, filterValue, filterProperty) => analytic[filterProperty] <= filterValue,
  in: (analytic, filterValue, filterProperty) => filterValue.includes(analytic[filterProperty]),
};

const applyFilter = (analytics, filterProperty, operator, value) => {
  const filterMethod = FILTER_TYPE_TO_METHOD[operator];

  return filterMethod
    ? analytics.filter(analytic => filterMethod(analytic, value, filterProperty))
    : analytics;
};

/**
 * Filter and return the matched Analytics.
 * @param {*} analytics List of analytics
 * @param {*} filter Filter object. Sample format:
 *                    filter: {
 *                        orgUnitCode: { '=': 'DL_11' },
 *                        period: { '>': 20200301, '<': 20200401 }
 *                        value: 20 // equivalent to { '=': 20 }
 *                    }
 */
export const filterAnalytics = (analytics, filter = {}) => {
  let filteredAnalytics = analytics;

  Object.entries(filter).forEach(([property, value]) => {
    const filterProperty = property || 'value';

    // If value is object format (eg: { '>': 3, '<': 6 }), process each of the filter entry.
    if (typeof value === 'object') {
      Object.entries(value).forEach(([filterOperator, filterValue]) => {
        filteredAnalytics = applyFilter(
          filteredAnalytics,
          filterProperty,
          filterOperator,
          filterValue,
        );
      });
    } else {
      // Assume that the value is raw data (eg: value: 20). Apply '=' filter.
      const operator = '=';

      filteredAnalytics = applyFilter(filteredAnalytics, filterProperty, operator, value);
    }
  });

  return filteredAnalytics;
};
