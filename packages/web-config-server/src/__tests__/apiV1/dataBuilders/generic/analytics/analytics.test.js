/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { analytics } from '/apiV1/dataBuilders/generic/analytics/analytics';

describe('analytics', () => {
  const ANALYTICS = [
    { dataElement: 'TEST01', orgUnit: 'TO', period: '20190101', value: 1 },
    { dataElement: 'TEST02', orgUnit: 'PG', period: '20200101', value: 2 },
  ];

  const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
    fetchAnalytics: jest.fn().mockResolvedValue({ results: ANALYTICS }),
  });

  it('fetches analytics using the `dataElementCodes` specified in the config', async () => {
    const dataElementCodes = ['TEST01', 'TEST02'];
    await analytics({ dataBuilderConfig: { dataElementCodes } }, aggregator);
    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      dataElementCodes,
      expect.anything(),
      undefined,
      expect.anything(),
    );
  });

  it('uses an `aggregationType` if specified in the config', async () => {
    const aggregationType = 'SUM';
    await analytics({ dataBuilderConfig: { dataElementCodes: [], aggregationType } }, aggregator);
    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      expect.anything(),
      expect.anything(),
      undefined,
      expect.objectContaining({ aggregationType }),
    );
  });

  it('returns the fetched analytics', async () => {
    const response = await analytics(
      { dataBuilderConfig: { dataElementCodes: ['TEST01', 'TEST02'] } },
      aggregator,
    );
    expect(response).toStrictEqual({ data: ANALYTICS });
  });
});
