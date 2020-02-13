import { DataBroker } from '@tupaia/data-broker';
import { Aggregator } from './Aggregator';

export const createAggregator = (AggregatorClass = Aggregator) => {
  const dataBroker = new DataBroker();
  return new AggregatorClass(dataBroker);
};
