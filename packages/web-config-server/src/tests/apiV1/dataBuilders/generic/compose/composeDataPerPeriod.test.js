/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { composeDataPerPeriod } from '/apiV1/dataBuilders/generic/compose/composeDataPerPeriod';
import * as FetchComposedData from '/apiV1/dataBuilders/helpers/fetchComposedData';

const aggregator = {};
const dhisApi = {};
const config = {};

const stubFetchComposedData = expectedResults => {
  const fetchComposedDataStub = sinon.stub(FetchComposedData, 'fetchComposedData');
  fetchComposedDataStub.returns({}).withArgs(config, aggregator, dhisApi).returns(expectedResults);
};

describe('composeDataPerPeriod', () => {
  afterEach(() => {
    FetchComposedData.fetchComposedData.restore();
  });

  it('should throw an error if non period data are fetched', async () => {
    const data = [
      { timestamp: 1569888000000, name: 'Oct 2019', count: 1 },
      { name: 'Nov 2019', count: 2 },
    ];
    stubFetchComposedData({
      results: { data },
    });

    return expect(composeDataPerPeriod(config, aggregator, dhisApi)).to.be.rejectedWith(
      'composed of period data builders',
    );
  });

  it('should compose period data from a single data builder', async () => {
    const data = [
      { timestamp: 1567296000000, name: 'Oct 2019', count: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', count: 1 },
      { timestamp: 1572566400000, name: 'Nov 2019', count: 2 },
    ];
    stubFetchComposedData({ results: { data } });

    return expect(
      composeDataPerPeriod(config, aggregator, dhisApi),
    ).to.eventually.have.deep.property('data', data);
  });

  it('should compose period data from multiple data builders', async () => {
    const countData = [
      { timestamp: 1567296000000, name: 'Sep 2019', count: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', count: 1 },
      { timestamp: 1572566400000, name: 'Nov 2019', count: 2 },
    ];
    const percentageData = [
      { timestamp: 1567296000000, name: 'Sep 2019', percentage: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', percentage: 0.1 },
      { timestamp: 1572566400000, name: 'Nov 2019', percentage: 0.2 },
    ];
    stubFetchComposedData({
      count: { data: countData },
      percentage: { data: percentageData },
    });

    return expect(
      composeDataPerPeriod(config, aggregator, dhisApi),
    ).to.eventually.have.deep.property('data', [
      { timestamp: 1567296000000, name: 'Sep 2019', count: 0, percentage: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', count: 1, percentage: 0.1 },
      { timestamp: 1572566400000, name: 'Nov 2019', count: 2, percentage: 0.2 },
    ]);
  });

  it('should replace "value" keys in the response items with a corresponding key from the builder config', async () => {
    const data = [
      { timestamp: 1567296000000, name: 'Sep 2019', value: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', value: 10 },
      { timestamp: 1572566400000, name: 'Nov 2019', value: 20 },
    ];
    stubFetchComposedData({ results: { data } });

    return expect(
      composeDataPerPeriod(config, aggregator, dhisApi),
    ).to.eventually.have.deep.property('data', [
      { timestamp: 1567296000000, name: 'Sep 2019', results: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', results: 10 },
      { timestamp: 1572566400000, name: 'Nov 2019', results: 20 },
    ]);
  });
});
