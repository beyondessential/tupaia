/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import * as FetchComposedData from '/apiV1/dataBuilders/helpers/fetchComposedData';
import { composeData } from '/apiV1/dataBuilders/generic/compose';

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator');
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

const stubFetchComposedData = expectedResults => {
  jest.spyOn(FetchComposedData, 'fetchComposedData').mockResolvedValue(expectedResults);
};

describe('composeData', () => {
  it('should compose data', async () => {
    const testConfig = {
      dataBuilderConfig: {
        dataBuilders: {
          series1: {},
          series2: {},
        },
      },
    };
    const data1 = [
      { name: 'Name 1', value: 1 },
      { name: 'Name 2', value: 0.4 },
    ];
    const data2 = [
      { name: 'Name 2', value: 4 },
      { name: 'Name 1', value: 'No Data' },
    ];
    stubFetchComposedData({
      series1: { data: data1 },
      series2: { data: data2 },
    });

    const response = await composeData(testConfig, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { name: 'series1', 'Name 1': 1, 'Name 2': 0.4 },
        { name: 'series2', 'Name 1': 'No Data', 'Name 2': 4 },
      ],
    });
  });

  it('should compose data from one datapoint', async () => {
    const testConfig = {
      dataBuilderConfig: {
        dataBuilders: {
          series1: {},
          series2: {},
        },
      },
    };
    const data1 = [{ name: 'Name 1', value: 1 }];
    const data2 = [{ name: 'Name 1', value: 4 }];
    stubFetchComposedData({
      series1: { data: data1 },
      series2: { data: data2 },
    });

    const response = await composeData(testConfig, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { name: 'series1', 'Name 1': 1 },
        { name: 'series2', 'Name 1': 4 },
      ],
    });
  });

  it('should compose data from more than 2 sources', async () => {
    const testConfig = {
      dataBuilderConfig: {
        dataBuilders: {
          series1: {},
          series2: {},
          series3: {},
        },
      },
    };
    const data1 = [
      { name: 'Name 1', value: 1 },
      { name: 'Name 2', value: 2 },
      { name: 'Name 3', value: 3 },
    ];
    const data2 = [
      { name: 'Name 1', value: 4 },
      { name: 'Name 2', value: 5 },
      { name: 'Name 3', value: 6 },
    ];
    const data3 = [
      { name: 'Name 1', value: 7 },
      { name: 'Name 2', value: 8 },
      { name: 'Name 3', value: 9 },
    ];
    stubFetchComposedData({
      series1: { data: data1 },
      series2: { data: data2 },
      series3: { data: data3 },
    });

    const response = await composeData(testConfig, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { name: 'series1', 'Name 1': 1, 'Name 2': 2, 'Name 3': 3 },
        { name: 'series2', 'Name 1': 4, 'Name 2': 5, 'Name 3': 6 },
        { name: 'series3', 'Name 1': 7, 'Name 2': 8, 'Name 3': 9 },
      ],
    });
  });

  it('should return according to sortOrder', async () => {
    const testConfig = {
      dataBuilderConfig: {
        dataBuilders: {
          series1: { sortOrder: 2 },
          series2: { sortOrder: 3 },
          series3: { sortOrder: 1 },
        },
      },
    };
    const data1 = [
      { name: 'Name 1', value: 1 },
      { name: 'Name 2', value: 2 },
      { name: 'Name 3', value: 3 },
    ];
    const data2 = [
      { name: 'Name 1', value: 4 },
      { name: 'Name 2', value: 5 },
      { name: 'Name 3', value: 6 },
    ];
    const data3 = [
      { name: 'Name 1', value: 7 },
      { name: 'Name 2', value: 8 },
      { name: 'Name 3', value: 9 },
    ];
    stubFetchComposedData({
      series1: { data: data1 },
      series2: { data: data2 },
      series3: { data: data3 },
    });

    const response = await composeData(testConfig, aggregator, dhisApi);
    expect(response).toStrictEqual({
      data: [
        { name: 'series3', 'Name 1': 7, 'Name 2': 8, 'Name 3': 9 },
        { name: 'series1', 'Name 1': 1, 'Name 2': 2, 'Name 3': 3 },
        { name: 'series2', 'Name 1': 4, 'Name 2': 5, 'Name 3': 6 },
      ],
    });
  });
});
