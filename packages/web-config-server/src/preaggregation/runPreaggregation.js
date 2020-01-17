/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { getDhisApiInstance } from '@tupaia/data-broker';
import * as aggregators from './aggregators';

export const runPreaggreagation = async aggregatorName => {
  if (aggregatorName.toLowerCase() === 'all') {
    return runAllAggregators();
  }
  return runSpecificAggregator(aggregatorName);
};

const runSpecificAggregator = async aggregatorName => {
  const regionalDhisApiInstance = getDhisApiInstance();
  await regionalDhisApiInstance.updateAnalyticsTables();
  await aggregators[aggregatorName](regionalDhisApiInstance);
  await regionalDhisApiInstance.updateAnalyticsTables();
};

const runAllAggregators = async () => {
  const regionalDhisApiInstance = getDhisApiInstance();
  await regionalDhisApiInstance.updateAnalyticsTables();
  const aggregatorFunctions = Object.values(aggregators);
  for (let i = 0; i < aggregatorFunctions.length; i++) {
    await aggregatorFunctions[i](regionalDhisApiInstance); // Await each aggregator as otherwise it will cause a huge spike in load
  }
  await regionalDhisApiInstance.updateAnalyticsTables();
};
