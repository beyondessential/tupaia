/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { fetchComposedData } from '/apiV1/dataBuilders/helpers/fetchComposedData';
import * as GetDataBuilder from '/apiV1/dataBuilders/getDataBuilder';

const DATA_RESPONSES = {
  countBuilder: [{ value: 1 }],
  percentageBuilder: [{ value: 0.1 }],
};
const DATA_BUILDERS = {
  countBuilder: {
    stub: jest.fn().mockResolvedValue(DATA_RESPONSES.countBuilder),
    config: { dataElementCode: 'STR_169' },
  },
  percentageBuilder: {
    stub: jest.fn().mockResolvedValue(DATA_RESPONSES.percentageBuilder),
    config: { limitRange: [0, 1] },
  },
};
const query = {
  startPeriod: '201910',
  endPeriod: '201911',
};
const dataServices = [{ isDataRegional: true }];
const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator');
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('fetchComposedData()', () => {
  const dataBuilderConfig = {
    dataBuilders: {
      count: {
        dataBuilder: 'countBuilder',
        dataBuilderConfig: DATA_BUILDERS.countBuilder.config,
      },
      percentage: {
        dataBuilder: 'percentageBuilder',
        dataBuilderConfig: DATA_BUILDERS.percentageBuilder.config,
      },
    },
    dataServices,
  };

  beforeAll(() => {
    jest
      .spyOn(GetDataBuilder, 'getDataBuilder')
      .mockImplementation(builderName => DATA_BUILDERS[builderName].stub);
  });

  it('should throw an error if no data builders are provided', () =>
    expect(fetchComposedData({ dataBuilderConfig: {} })).toBeRejectedWith('Data builders'));

  it('should invoke the specified data builders with the expected arguments', async () => {
    await fetchComposedData({ dataBuilderConfig, query }, aggregator, dhisApi);

    expect(DATA_BUILDERS.countBuilder.stub).toHaveBeenCalledOnceWith(
      { dataBuilderConfig: { ...DATA_BUILDERS.countBuilder.config, dataServices }, query },
      aggregator,
      dhisApi,
    );
    expect(DATA_BUILDERS.percentageBuilder.stub).toHaveBeenCalledOnceWith(
      { dataBuilderConfig: { ...DATA_BUILDERS.percentageBuilder.config, dataServices }, query },
      aggregator,
      dhisApi,
    );
  });

  it('should return a map of builder keys to data responses per builder ', async () => {
    const response = await fetchComposedData({ dataBuilderConfig, query }, aggregator, dhisApi);

    expect(response).toStrictEqual({
      count: DATA_RESPONSES.countBuilder,
      percentage: DATA_RESPONSES.percentageBuilder,
    });
  });
});
