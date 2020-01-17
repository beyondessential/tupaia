/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getDhisApiInstance } from '@tupaia/data-broker';

/**
 * Runs the provided `aggregation` callback in all DHIS instances,
 * i.e. Regional and Tonga
 *
 * @param {Function} runAggregation
 * @param {DhisApi} regionalDhisApi
 * @param {boolean} isDataRegional
 */
export const runAggregationOnAllDhisInstances = (runAggregation, regionalDhisApi) => {
  const tongaDhisApi = getDhisApiInstance({ entityCode: 'TO', isDataRegional: false });

  runAggregation(regionalDhisApi);
  runAggregation(tongaDhisApi);
};
