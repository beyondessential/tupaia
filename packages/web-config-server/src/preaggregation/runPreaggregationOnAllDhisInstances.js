/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getDhisApiInstance } from '/dhis';

/**
 * Runs the provided `aggregation` callback in all DHIS instances,
 * i.e. Regional and Tonga
 *
 * @param {Function} runPreaggregation
 * @param {DhisApi} regionalDhisApi
 * @param {boolean} isDataRegional
 */
export const runPreaggregationOnAllDhisInstances = (
  runPreaggregation,
  aggregator,
  regionalDhisApi,
) => {
  const tongaDhisApi = getDhisApiInstance({ entityCode: 'TO', isDataRegional: false });

  runPreaggregation(aggregator, regionalDhisApi);
  runPreaggregation(aggregator, tongaDhisApi);
};
