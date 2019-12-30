/**
 * @param {Array} results results from dhis2 query
 */
export const sumResults = results => {
  const total = results.reduce((currentTotal, result) => currentTotal + result.value, 0);
  return {
    name: 'Total',
    value: total,
  };
};
