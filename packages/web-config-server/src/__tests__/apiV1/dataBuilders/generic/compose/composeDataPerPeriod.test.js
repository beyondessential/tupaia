/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import { composeDataPerPeriod } from '/apiV1/dataBuilders/generic/compose/composeDataPerPeriod';
import * as FetchComposedData from '/apiV1/dataBuilders/helpers/fetchComposedData';

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator');
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');
const config = { dataBuilderConfig: {} };

const stubFetchComposedData = expectedResults => {
  const fetchComposedData = jest.spyOn(FetchComposedData, 'fetchComposedData');
  when(fetchComposedData)
    .calledWith(config, aggregator, dhisApi)
    .mockResolvedValue(expectedResults);
};

describe('composeDataPerPeriod', () => {
  it('should throw an error if non period data are fetched', async () => {
    const data = [
      { timestamp: 1569888000000, name: 'Oct 2019', count: 1 },
      { name: 'Nov 2019', count: 2 },
    ];
    stubFetchComposedData({
      results: { data },
    });

    await expect(composeDataPerPeriod(config, aggregator, dhisApi)).toBeRejectedWith(
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

    const response = await composeDataPerPeriod(config, aggregator, dhisApi);
    expect(response).toStrictEqual({ data });
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

    const response = await composeDataPerPeriod(config, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { timestamp: 1567296000000, name: 'Sep 2019', count: 0, percentage: 0 },
        { timestamp: 1569888000000, name: 'Oct 2019', count: 1, percentage: 0.1 },
        { timestamp: 1572566400000, name: 'Nov 2019', count: 2, percentage: 0.2 },
      ],
    });
  });

  it('should replace "value" keys in the response items with a corresponding key from the builder config', async () => {
    const data = [
      { timestamp: 1567296000000, name: 'Sep 2019', value: 0 },
      { timestamp: 1569888000000, name: 'Oct 2019', value: 10 },
      { timestamp: 1572566400000, name: 'Nov 2019', value: 20 },
    ];
    stubFetchComposedData({ results: { data } });

    const response = await composeDataPerPeriod(config, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { timestamp: 1567296000000, name: 'Sep 2019', results: 0 },
        { timestamp: 1569888000000, name: 'Oct 2019', results: 10 },
        { timestamp: 1572566400000, name: 'Nov 2019', results: 20 },
      ],
    });
  });
});
