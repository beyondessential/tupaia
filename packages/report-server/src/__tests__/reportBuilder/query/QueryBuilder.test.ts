/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import MockDate from 'mockdate';

import { AccessPolicy } from '@tupaia/access-policy';

import { QueryBuilder } from '../../../reportBuilder/query/QueryBuilder';
import { FetchReportQuery } from '../../../types';
import { ReqContext } from '../../../reportBuilder/context';

import { entityApiMock } from '../testUtils';

describe('QueryBuilder', () => {
  const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

  const HIERARCHY = 'explore';
  const ENTITIES = {
    explore: [
      { code: 'PG', country_code: 'PG', type: 'country' },
      { code: 'TO', country_code: 'TO', type: 'country' },
      { code: 'KI', country_code: 'KI', type: 'country' },
      { code: 'PROJ', country_code: 'PROJ', type: 'project' },
      { code: 'MY', country_code: 'MY', type: 'country' },
      { code: 'PG_Facility', country_code: 'PG', type: 'facility' },
    ],
  };

  const apiMock = entityApiMock(ENTITIES);

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Admin',
    services: {
      entity: apiMock,
    } as ReqContext['services'],
    accessPolicy: new AccessPolicy({
      PG: ['Admin'],
      TO: ['Admin'],
      PROJ: ['Admin'],
      MY: ['Public'],
    }),
  };

  /**
   * Fills the query with the minimum required fields,
   * so that the tests can focus on the specific fields under test
   */
  const inputQuery = (input: Partial<FetchReportQuery> = {}) => ({
    hierarchy: HIERARCHY,
    organisationUnitCodes: ['TO'],
    ...input,
  });

  /**
   * Fills the query with the minimum required fields,
   * so that the tests can focus on the specific fields under test
   */
  const outputQuery = (input: Partial<FetchReportQuery> = {}) => ({
    hierarchy: HIERARCHY,
    organisationUnitCodes: ['TO'],
    period: getPeriodString([2017, 1], [2020, 12]),
    startDate: '2017-01-01',
    endDate: '2020-12-31',
    ...input,
  });

  const getPeriodString = (
    [startYear, startMonth]: [number, number],
    [endYear, endMonth]: [number, number],
  ) => {
    const periods = [];

    for (let year = startYear; year <= endYear; year++) {
      const currentStartMonth = year === startYear ? startMonth : 1;
      const currentEndMonth = year === endYear ? endMonth : 12;
      for (let month = currentStartMonth; month <= currentEndMonth; month++) {
        periods.push(`${year}${month.toString().padStart(2, '0')}`);
      }
    }

    return periods.join(';');
  };

  it('handles all supported params', async () => {
    const config = { fetch: { dataElements: ['DE'] }, transform: [] };
    const query = {
      organisationUnitCodes: ['TO'],
      hierarchy: 'explore',
      period: getPeriodString([2020, 1], [2020, 12]),
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    };

    const builtQuery = await new QueryBuilder(reqContext, config, query).build();
    expect(builtQuery).toStrictEqual(builtQuery);
  });

  describe('period params', () => {
    beforeAll(() => {
      MockDate.set(CURRENT_DATE_STUB);
    });

    afterAll(() => {
      MockDate.reset();
    });

    describe('no date specs in config', () => {
      type TestParams = [string, { query: FetchReportQuery }, FetchReportQuery];

      const testData: TestParams[] = [
        ['empty params - uses the default period', { query: inputQuery() }, outputQuery()],
        [
          'startDate and endDate are provided - period is adjusted to them',
          { query: inputQuery({ startDate: '2020-01-01', endDate: '2020-06-02' }) },
          outputQuery({
            period: `${getPeriodString([2020, 1], [2020, 5])};20200601;20200602`,
            startDate: '2020-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'startDate is empty, period is empty - uses default start period',
          { query: inputQuery({ endDate: '2020-06-02' }) },
          outputQuery({
            period: `${getPeriodString([2017, 1], [2020, 5])};20200601;20200602`,
            startDate: '2017-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'endDate is empty, period is empty - uses default end period',
          { query: inputQuery({ startDate: '2020-01-01' }) },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate and endDate are empty - uses start and end period',
          { query: inputQuery({ period: getPeriodString([2020, 1], [2020, 6]) }) },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 6]),
            startDate: '2020-01-01',
            endDate: '2020-06-30',
          }),
        ],
      ];

      it.each(testData)('%s', async (_, { query }, expected) => {
        const config = { fetch: { dataElements: ['DE'] }, transform: [] };
        const received = await new QueryBuilder(reqContext, config, query).build();
        expect(received).toStrictEqual(expected);
      });
    });

    describe('date specs in config', () => {
      type TestParams = [
        string,
        { config: { fetch: Record<string, unknown> }; query: FetchReportQuery },
        Record<string, unknown>,
      ];

      const testData: TestParams[] = [
        [
          'startDate string specs - uses it if query.startDate is empty',
          {
            config: { fetch: { startDate: '2020-01-01' } },
            query: inputQuery(),
          },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate string specs - overrides not empty query.startDate',
          {
            config: { fetch: { startDate: '2020-01-01' } },
            query: inputQuery({ startDate: '2020-03-05' }),
          },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'endDate string specs - uses it if query.endDate is empty',
          {
            config: { fetch: { endDate: '2020-12-31' } },
            query: inputQuery(),
          },
          outputQuery({
            period: getPeriodString([2017, 1], [2020, 12]),
            startDate: '2017-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'endDate string specs - overrides not empty query.endDate',
          {
            config: { fetch: { endDate: '2020-12-31' } },
            query: inputQuery({ endDate: '2020-10-05' }),
          },
          outputQuery({
            period: getPeriodString([2017, 1], [2020, 12]),
            startDate: '2017-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate object specs - applies offset to endDate to calculate startDate',
          {
            config: { fetch: { startDate: { unit: 'year', offset: '-2' } } },
            query: inputQuery({
              startDate: '2020-05-06', // will be ignored - (offset is applied on top of endDate)
              endDate: '2020-10-01',
            }),
          },
          outputQuery({
            period: `${getPeriodString([2018, 10], [2020, 9])};20201001`,
            startDate: '2018-10-01',
            endDate: '2020-10-01',
          }),
        ],
        [
          'endDate object specs - applies offset to endDate to calculate endDate',
          {
            config: { fetch: { endDate: { unit: 'year', offset: '+2' } } },
            query: inputQuery({ startDate: '2020-01-01', endDate: '2020-06-03' }),
          },
          outputQuery({
            period: `${getPeriodString([2020, 1], [2022, 5])};20220601;20220602;20220603`,
            startDate: '2020-01-01',
            endDate: '2022-06-03',
          }),
        ],
        [
          'complex date object specs',
          {
            config: {
              fetch: {
                startDate: {
                  unit: 'year',
                  offset: '-2',
                  modifier: 'start_of',
                  modifierUnit: 'year',
                },
                endDate: {
                  unit: 'year',
                  offset: '-1',
                  modifier: 'end_of',
                  modifierUnit: 'year',
                },
              },
            },
            query: inputQuery({
              startDate: '2020-05-06', // will be ignored - (offset is applied on top of endDate)
              endDate: '2020-10-01',
            }),
          },
          outputQuery({
            period: `${getPeriodString([2018, 1], [2019, 12])}`,
            startDate: '2018-01-01',
            endDate: '2019-12-31',
          }),
        ],
      ];

      it.each(testData)('%s', async (_, { config, query }, expected) => {
        const fullConfig = { transform: [], ...config };
        const received = await new QueryBuilder(reqContext, fullConfig, query).build();
        expect(received).toStrictEqual(expected);
      });
    });
  });

  describe('organisation unit params', () => {
    beforeAll(() => {
      MockDate.set(CURRENT_DATE_STUB);
    });

    afterAll(() => {
      MockDate.reset();
    });

    describe('organisation unit specs in config', () => {
      type TestParams = [
        string,
        { config: { fetch: Record<string, unknown> }; query: FetchReportQuery },
        Record<string, unknown>,
      ];

      const testData: TestParams[] = [
        [
          'uses provided organisation unit codes if have access',
          {
            config: { fetch: { organisationUnits: ['PG', 'PG_Facility'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['PG', 'PG_Facility'],
          }),
        ],
        [
          'organisation unit not included if no access',
          {
            config: { fetch: { organisationUnits: ['PG', 'KI'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['PG'],
          }),
        ],
        [
          'organisation unit not included if access too low',
          {
            config: { fetch: { organisationUnits: ['PG', 'MY'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['PG'],
          }),
        ],
        [
          'organisation unit not included if project',
          {
            config: { fetch: { organisationUnits: ['PG', 'PROJ'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['PG'],
          }),
        ],
        [
          'can use requested organisation unit code if using $requested',
          {
            config: { fetch: { organisationUnits: ['$requested', 'PG'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['TO', 'PG'],
          }),
        ],
        [
          'can use requested organisation unit codes if using $requested',
          {
            config: { fetch: { organisationUnits: ['$requested', 'PG'] } },
            query: inputQuery({ organisationUnitCodes: ['TO', 'WS'] }),
          },
          outputQuery({
            organisationUnitCodes: ['TO', 'WS', 'PG'],
          }),
        ],
      ];

      it.each(testData)('%s', async (_, { config, query }, expected) => {
        const fullConfig = { transform: [], ...config };
        const received = await new QueryBuilder(reqContext, fullConfig, query).build();
        expect(received).toStrictEqual(expected);
      });
    });
  });
});
