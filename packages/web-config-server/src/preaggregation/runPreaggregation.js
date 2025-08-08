import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { getDhisApiInstance } from '/dhis';
import winston from 'winston';
import * as preaggregators from './preaggregators';

export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

const getPreaggregators = preaggregationName =>
  preaggregationName.toLowerCase() === 'all'
    ? preaggregators
    : { [preaggregationName]: preaggregators[preaggregationName] };

const runPreaggregators = async preaggregatorsToRun => {
  const aggregator = new Aggregator(
    new DataBroker({
      accessPolicy: new AccessPolicy({
        DL: [BES_ADMIN_PERMISSION_GROUP],
      }),
    }),
  );
  const regionalDhisApiInstance = getDhisApiInstance();
  await regionalDhisApiInstance.updateAnalyticsTables();
  const preaggregatorEntries = Object.entries(preaggregatorsToRun);
  for (let i = 0; i < preaggregatorEntries.length; i++) {
    const [name, preaggregator] = preaggregatorEntries[i];
    winston.info(`Starting preaggregator: ${name}`);
    try {
      await preaggregator(aggregator, regionalDhisApiInstance); // Await each preaggregator as otherwise it will cause a huge spike in load
    } catch (error) {
      winston.error(`Preaggregator ${name} failed with error: ${error.message}`);
    }
  }
  await regionalDhisApiInstance.updateAnalyticsTables();
  await aggregator.close();
  winston.info('Preaggregation finished, aggregator closed');
};

export const runPreaggregation = async preaggregationName => {
  const preaggregatorsToRun = getPreaggregators(preaggregationName);
  return runPreaggregators(preaggregatorsToRun);
};
