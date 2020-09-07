/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
import { analyticsPerPeriod } from '/apiV1/dataBuilders/generic/analytics/analyticsPerPeriod';

describe('analyticsPerPeriod', () => {
  // Define the results in non-ascending period order to assert that they are sorted correctly
  const ANALYTICS = [
    // Period: 20200101
    { dataElement: 'CASES', orgUnit: 'TO', period: '20200101', value: 11 },
    { dataElement: 'POP', orgUnit: 'TO', period: '20200101', value: 110 },
    // Period: 20190101
    { dataElement: 'CASES', orgUnit: 'TO', period: '20190101', value: 10 },
    { dataElement: 'POP', orgUnit: 'TO', period: '20190101', value: 100 },
  ];

  const TIMESTAMPS = {
    '2019-01-01T00:00:00Z': 1546300800000,
    '2020-01-01T00:00:00Z': 1577836800000,
  };

  const aggregator = sinon.createStubInstance(Aggregator, {
    fetchAnalytics: sinon.stub().callsFake(async dataElementCodes => ({
      results: ANALYTICS.filter(({ dataElement }) => dataElementCodes.includes(dataElement)),
    })),
  });

  beforeEach(() => {
    aggregator.fetchAnalytics.resetHistory();
  });

  it('uses an `aggregationType` if specified in the config', async () => {
    const aggregationType = 'SUM';
    await analyticsPerPeriod(
      { dataBuilderConfig: { dataElementCodes: [], aggregationType } },
      aggregator,
    );
    expect(aggregator.fetchAnalytics).to.have.been.calledOnceWith(
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match({ aggregationType }),
    );
  });

  describe('series config', () => {
    const dataBuilderConfig = {
      series: [
        { key: 'cases', dataElementCodes: ['CASES'] },
        { key: 'population', dataElementCodes: ['POP'] },
      ],
    };
    it('uses the `dataElementCodes` included in series specified in the config', async () => {
      await analyticsPerPeriod({ dataBuilderConfig }, aggregator);
      expect(aggregator.fetchAnalytics).to.have.been.calledOnceWith(
        sinon.match.array.contains(['CASES', 'POP']).and(sinon.match.has('length', 2)),
      );
    });

    it('returns timestamped results using the specified series, sorted by timestamp', async () =>
      expect(analyticsPerPeriod({ dataBuilderConfig }, aggregator)).to.eventually.deep.equal({
        data: [
          { timestamp: TIMESTAMPS['2019-01-01T00:00:00Z'], cases: 10, population: 100 },
          { timestamp: TIMESTAMPS['2020-01-01T00:00:00Z'], cases: 11, population: 110 },
        ],
      }));
  });

  describe('non-series config', () => {
    it('uses the `dataElementCodes` included in the config', async () => {
      const dataElementCodes = ['CASES'];
      await analyticsPerPeriod({ dataBuilderConfig: { dataElementCodes } }, aggregator);
      expect(aggregator.fetchAnalytics).to.have.been.calledOnceWith(dataElementCodes);
    });

    it('returns timestamped results using the default series key, sorted by timestamp', async () =>
      expect(
        analyticsPerPeriod({ dataBuilderConfig: { dataElementCodes: ['CASES'] } }, aggregator),
      ).to.eventually.deep.equal({
        data: [
          { timestamp: TIMESTAMPS['2019-01-01T00:00:00Z'], value: 10 },
          { timestamp: TIMESTAMPS['2020-01-01T00:00:00Z'], value: 11 },
        ],
      }));
  });
});
