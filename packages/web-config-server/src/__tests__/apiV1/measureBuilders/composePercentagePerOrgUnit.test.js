/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import { composePercentagePerOrgUnit } from '/apiV1/measureBuilders/composePercentagePerOrgUnit';
import * as FetchComposedData from '/apiV1/measureBuilders/helpers';

const models = createJestMockInstance('@tupaia/database', 'ModelRegistry');
const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator');
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');
const config = { dataBuilderConfig: {} };
const query = { dataElementCode: 'value' };

const stubFetchComposedData = expectedResults => {
  const fetchComposedData = jest.spyOn(FetchComposedData, 'fetchComposedData');
  when(fetchComposedData)
    .calledWith(models, aggregator, dhisApi, query, config)
    .mockResolvedValue(expectedResults);
};

describe('composePercentagePerOrgUnit', () => {
  it('should compose data per org unit into percentages', async () => {
    stubFetchComposedData({
      numerator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 1 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 2 },
        ],
      },
      denominator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 2 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 8 },
        ],
      },
    });

    const response = await composePercentagePerOrgUnit(models, aggregator, dhisApi, query, config);
    expect(response).toStrictEqual({
      data: [
        {
          name: 'Kolonga',
          organisationUnitCode: 'TO_KlongaHC',
          value: 0.5,
          metadata: { numerator: 1, denominator: 2 },
        },
        {
          name: 'Nukunuku',
          organisationUnitCode: 'TO_Nukuhc',
          value: 0.25,
          metadata: { numerator: 2, denominator: 8 },
        },
      ],
      period: null,
    });
  });

  it('should exclude non numeric percentages from the results', async () => {
    stubFetchComposedData({
      numerator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 1 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 2 },
        ],
      },
      denominator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 2 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 0 }, // 0 denominator
        ],
      },
    });

    const response = await composePercentagePerOrgUnit(models, aggregator, dhisApi, query, config);
    expect(response).toStrictEqual({
      data: [
        {
          name: 'Kolonga',
          organisationUnitCode: 'TO_KlongaHC',
          value: 0.5,
          metadata: { numerator: 1, denominator: 2 },
        },
      ],
      period: null,
    });
  });

  it('should correctly compose periods', async () => {
    stubFetchComposedData({
      numerator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 1 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 2 },
        ],
        period: {
          latestAvailable: '20190103',
          earliestAvailable: '20170801',
          requested: 'NOT_TESTED',
        },
      },
      denominator: {
        data: [
          { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 2 },
          { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 8 },
        ],
        period: {
          latestAvailable: '20200103',
          earliestAvailable: '20180801',
          requested: 'NOT_TESTED',
        },
      },
    });

    const response = await composePercentagePerOrgUnit(models, aggregator, dhisApi, query, config);
    expect(response).toStrictEqual({
      data: [
        {
          name: 'Kolonga',
          organisationUnitCode: 'TO_KlongaHC',
          value: 0.5,
          metadata: { numerator: 1, denominator: 2 },
        },
        {
          name: 'Nukunuku',
          organisationUnitCode: 'TO_Nukuhc',
          value: 0.25,
          metadata: { numerator: 2, denominator: 8 },
        },
      ],
      period: {
        latestAvailable: '20200103',
        earliestAvailable: '20170801',
        requested: 'NOT_TESTED',
      },
    });
  });
});
