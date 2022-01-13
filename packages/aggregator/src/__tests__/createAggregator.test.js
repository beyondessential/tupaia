import { Aggregator } from '../Aggregator';
import { createAggregator } from '../createAggregator';

const CustomAggregatorClass = class CustomAggregator {
  constructor(dataBroker) {
    this.dataBroker = dataBroker;
  }
};

describe('createAggregator()', () => {
  const dataBroker = {};

  it('uses the package Aggregator class by default', () => {
    const aggregator = createAggregator(dataBroker);
    expect(aggregator).toBeInstanceOf(Aggregator);
  });

  it('allows injecting a custom Aggregator class', () => {
    const aggregator = createAggregator(dataBroker, CustomAggregatorClass);
    expect(aggregator).toBeInstanceOf(CustomAggregatorClass);
  });

  it('call the Aggregator constructor with the DataBroker class', () => {
    const aggregator = createAggregator(dataBroker);
    expect(aggregator.dataBroker === dataBroker).toBeTrue();
  });
});
