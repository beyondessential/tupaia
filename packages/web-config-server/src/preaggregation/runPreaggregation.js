/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '/aggregator';
import { getDhisApiInstance } from '/dhis';
import * as preaggregators from './preaggregators';

const getPreaggregators = preaggregationName =>
  preaggregationName.toLowerCase() === 'all'
    ? Object.values(preaggregators)
    : [preaggregators[preaggregationName]];

const runPreaggregators = async preaggregatorsToRun => {
  const aggregator = createAggregator(Aggregator);
  const regionalDhisApiInstance = getDhisApiInstance();
  await regionalDhisApiInstance.updateAnalyticsTables();
  for (let i = 0; i < preaggregatorsToRun.length; i++) {
    await preaggregatorsToRun[i](aggregator, regionalDhisApiInstance); // Await each preaggregator as otherwise it will cause a huge spike in load
  }
  await regionalDhisApiInstance.updateAnalyticsTables();
};

export const runPreaggregation = async preaggregationName => {
  const preaggregatorsToRun = getPreaggregators(preaggregationName);
  return runPreaggregators(preaggregatorsToRun);
};
