/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from './Aggregator';

/**
 * @param dataBroker
 * @param {Aggregator|undefined} AggregatorClass
 * @param additionalParams
 * @return {Aggregator}
 */
export const createAggregator = (dataBroker, AggregatorClass = Aggregator, ...additionalParams) => {
  return new AggregatorClass(dataBroker, ...additionalParams);
};
