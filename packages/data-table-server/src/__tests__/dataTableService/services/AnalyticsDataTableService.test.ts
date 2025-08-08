import MockDate from 'mockdate';
import { AccessPolicy } from '@tupaia/access-policy';
import { MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { ENTITIES, ENTITY_RELATIONS } from './fixtures';

const CURRENT_DATE_STUB = '2023-12-31';

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
    endDate = CURRENT_DATE_STUB,
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

const accessPolicy = new AccessPolicy({ DL: ['Public'] });
const apiClient = new MockTupaiaApiClient({
  entity: new MockEntityApi(ENTITIES, ENTITY_RELATIONS),
});
const analyticsDataTableService = new DataTableServiceBuilder()
  .setServiceType('analytics')
  .setContext({ apiClient, accessPolicy })
  .build();

describe('AnalyticsDataTableService', () => {
  beforeEach(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  afterEach(() => {
    MockDate.reset();
  });

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
        'startDate must be a valid ISO 8601 date: YYYY-MM-DD',
      ],
      [
        'endDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataElementCodes: ['PSSS_AFR_Cases'],
          endDate: 'dog',
        },
        'endDate must be a valid ISO 8601 date: YYYY-MM-DD',
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
      expect(() => analyticsDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = analyticsDataTableService.getParameters();
    expect(parameters).toEqual([
      { config: { defaultValue: 'explore', type: 'hierarchy' }, name: 'hierarchy' },
      {
        config: {
          innerType: { required: true, type: 'string' },
          required: true,
          type: 'organisationUnitCodes',
        },
        name: 'organisationUnitCodes',
      },
      {
        config: {
          innerType: { required: true, type: 'string' },
          required: true,
          type: 'dataElementCodes',
        },
        name: 'dataElementCodes',
      },
      { config: { defaultValue: '2018-12-01', type: 'string' }, name: 'startDate' },
      { config: { defaultValue: '2023-12-31', type: 'string' }, name: 'endDate' },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch data from Aggregator.fetchAnalytics()', async () => {
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

    it('maps project organisationUnits to child countries', async () => {
      const dataElementCodes = ['PSSS_AFR_Cases', 'PSSS_ILI_Cases'];
      const startDate = '2020-01-01';
      const endDate = '2020-01-16';

      const analytics = await analyticsDataTableService.fetchData({
        hierarchy: 'explore',
        organisationUnitCodes: ['explore'],
        dataElementCodes,
        startDate,
        endDate,
      });

      const { results: expectedAnalytics } = fetchFakeAnalytics(dataElementCodes, {
        organisationUnitCodes: ['AU', 'FJ'], // AU and FJ are the countries in explore
        startDate,
        endDate,
      });

      expect(analytics).toEqual(expectedAnalytics);
    });
  });
});
