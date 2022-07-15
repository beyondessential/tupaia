/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
import { analytics } from '/apiV1/dataBuilders/generic/analytics/analytics';

describe('analytics', () => {
  const ANALYTICS = [
    { dataElement: 'TEST01', orgUnit: 'TO', period: '20190101', value: 1 },
    { dataElement: 'TEST02', orgUnit: 'PG', period: '20200101', value: 2 },
  ];

  const aggregator = sinon.createStubInstance(Aggregator, {
    fetchAnalytics: sinon.stub().resolves({ results: ANALYTICS }),
  });

  beforeEach(() => {
    aggregator.fetchAnalytics.resetHistory();
  });

  it('fetches analytics using the `dataElementCodes` specified in the config', async () => {
    const dataElementCodes = ['TEST01', 'TEST02'];
    await analytics({ dataBuilderConfig: { dataElementCodes } }, aggregator);
    expect(aggregator.fetchAnalytics).to.have.been.calledOnceWith(dataElementCodes);
  });

  it('uses an `aggregationType` if specified in the config', async () => {
    const aggregationType = 'SUM';
    await analytics({ dataBuilderConfig: { dataElementCodes: [], aggregationType } }, aggregator);
    expect(aggregator.fetchAnalytics).to.have.been.calledOnceWith(
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match({ aggregationType }),
    );
  });

  it('returns the fetched analytics', async () =>
    expect(
      analytics({ dataBuilderConfig: { dataElementCodes: ['TEST01', 'TEST02'] } }, aggregator),
    ).to.eventually.deep.equal({
      data: ANALYTICS,
    }));
});
