/**
 * Add the analytics together across the facilities and periods listed in the analytic response, and
 * return an array with the sum of each data element
 *
 * @param {Array} analytics
 * @returns {Array}
 */
export const sumEachDataElement = analytics => {
  const sumsPerDataElement = {};
  analytics.forEach(({ dataElement, value }) => {
    if (!sumsPerDataElement[dataElement]) {
      sumsPerDataElement[dataElement] = value; // we set to value rather than 0 as sometimes it is a text value
    } else {
      sumsPerDataElement[dataElement] += value;
    }
  });
  return Object.entries(sumsPerDataElement).map(([dataElement, value]) => ({ dataElement, value }));
};
