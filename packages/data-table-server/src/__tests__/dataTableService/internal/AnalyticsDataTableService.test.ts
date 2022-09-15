/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType as DataTableTypeClass } from '@tupaia/database';
import { createDataTableService } from '../../../dataTableService';
import { DataTableType } from '../../../models';

const TEST_ANALYTICS = [
  { period: '2020-01-01', organisationUnit: 'TO', dataElement: 'PSSS_AFR_Cases', value: 7 },
  { period: '2020-01-08', organisationUnit: 'TO', dataElement: 'PSSS_AFR_Cases', value: 12 },
  { period: '2020-01-15', organisationUnit: 'PG', dataElement: 'PSSS_AFR_Cases', value: 8 },
  { period: '2020-01-01', organisationUnit: 'PG', dataElement: 'PSSS_ILI_Cases', value: 7 },
  { period: '2020-01-08', organisationUnit: 'PG', dataElement: 'PSSS_ILI_Cases', value: 12 },
  { period: '2020-01-15', organisationUnit: 'TO', dataElement: 'PSSS_ILI_Cases', value: 8 },
];

const fetchFakeAnalytics = (
  dataElementCodes: string[],
  {
    organisationUnitCodes,
    startDate = '2020-01-01',
    endDate = '2020-12-31',
  }: { organisationUnitCodes: string[]; startDate?: string; endDate?: string },
) => {
  return {
    results: TEST_ANALYTICS.filter(
      analytic =>
        dataElementCodes.includes(analytic.dataElement) &&
        organisationUnitCodes.includes(analytic.organisationUnit) &&
        analytic.period >= startDate &&
        analytic.period <= endDate,
    ),
  };
};

jest.mock('@tupaia/aggregator', () => ({
  Aggregator: jest.fn().mockImplementation(() => ({
    fetchAnalytics: fetchFakeAnalytics,
  })),
}));

jest.mock('@tupaia/data-broker', () => ({
  DataBroker: jest.fn().mockImplementation(() => ({})),
}));

const analyticsDataTable = new DataTableTypeClass(
  {},
  { type: 'internal', code: 'analytics' },
) as DataTableType;

describe('AnalyticsDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      [
        'missing organisationUnitCodes',
        {
          hierarchy: 'psss',
          dataElementCodes: ['PSSS_AFR_Cases'],
        },
        'organisationUnitCodes is a required field',
      ],
      [
        'missing hierarchy',
        {
          organisationUnitCodes: ['TO'],
          dataElementCodes: ['PSSS_AFR_Cases'],
        },
        'hierarchy is a required field',
      ],
      [
        'missing dataElementCodes',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
        },
        'dataElementCodes is a required field',
      ],
      [
        'startDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataElementCodes: ['PSSS_AFR_Cases'],
          startDate: 'cat',
        },
        'startDate should be in ISO 8601 format',
      ],
      [
        'endDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataElementCodes: ['PSSS_AFR_Cases'],
          endDate: 'dog',
        },
        'endDate should be in ISO 8601 format',
      ],
      [
        'aggregations wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataElementCodes: ['PSSS_AFR_Cases'],
          aggregations: ['RAW'],
        },
        'aggregations[0] must be a `object` type',
      ],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      const analyticsDataTableService = createDataTableService(
        analyticsDataTable,
        {} as TupaiaApiClient,
      );

      expect(() => analyticsDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('can fetch data from Aggregator.fetchAnalytics()', async () => {
    const analyticsDataTableService = createDataTableService(
      analyticsDataTable,
      {} as TupaiaApiClient,
    );

    const dataElementCodes = ['PSSS_AFR_Cases'];
    const organisationUnitCodes = ['TO'];

    const analytics = await analyticsDataTableService.fetchData({
      hierarchy: 'psss',
      organisationUnitCodes,
      dataElementCodes,
    });

    const { results: expectedAnalytics } = fetchFakeAnalytics(dataElementCodes, {
      organisationUnitCodes,
    });

    expect(analytics).toEqual(expectedAnalytics);
  });

  it('passes all parameters to Aggregator.fetchAnalytics()', async () => {
    const analyticsDataTableService = createDataTableService(
      analyticsDataTable,
      {} as TupaiaApiClient,
    );

    const dataElementCodes = ['PSSS_AFR_Cases', 'PSSS_ILI_Cases'];
    const organisationUnitCodes = ['PG'];
    const startDate = '2020-01-05';
    const endDate = '2020-01-10';

    const analytics = await analyticsDataTableService.fetchData({
      hierarchy: 'psss',
      organisationUnitCodes,
      dataElementCodes,
      startDate,
      endDate,
    });

    const { results: expectedAnalytics } = fetchFakeAnalytics(dataElementCodes, {
      organisationUnitCodes,
      startDate,
      endDate,
    });

    expect(analytics).toEqual(expectedAnalytics);
  });
});
