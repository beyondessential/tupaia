/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

// Add the results together across the facilities and periods listed in the analytic response, and
// return an array with the sum of each data element
export const sumEachDataElement = results => {
  const sumsPerDataElement = {};
  results.forEach(({ dataElement, value }) => {
    sumsPerDataElement[dataElement] = (sumsPerDataElement[dataElement] || 0) + value;
  });
  return Object.entries(sumsPerDataElement).map(([dataElement, value]) => ({ dataElement, value }));
};
