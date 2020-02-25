/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
    sumsPerDataElement[dataElement] = (sumsPerDataElement[dataElement] || 0) + value;
  });
  return Object.entries(sumsPerDataElement).map(([dataElement, value]) => ({ dataElement, value }));
};
