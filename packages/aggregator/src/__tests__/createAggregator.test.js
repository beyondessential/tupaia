import { DataBroker } from '@tupaia/data-broker';
import { Aggregator } from '../Aggregator';
import { createAggregator } from '../createAggregator';

jest.mock('@tupaia/data-broker');

const CustomAggregatorClass = class CustomAggregator {
  constructor(dataBroker) {
    this.dataBroker = dataBroker;
  }
};

describe('createAggregator()', () => {
  it('uses the package Aggregator class by default', () => {
    const aggregator = createAggregator();
    expect(aggregator).toBeInstanceOf(Aggregator);
  });

  it('allows injecting a custom Aggregator class', () => {
    const aggregator = createAggregator(CustomAggregatorClass);
    expect(aggregator).toBeInstanceOf(CustomAggregatorClass);
  });

  it('call the Aggregator constructor with the DataBroker class', () => {
    const aggregator = createAggregator();
    expect(aggregator.dataBroker).toBeInstanceOf(DataBroker);
  });
});
