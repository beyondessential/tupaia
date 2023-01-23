/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable jest/no-conditional-expect */

import MockDate from 'mockdate';

import { AccessPolicy } from '@tupaia/access-policy';
import { MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';

import { QueryBuilder } from '../../../reportBuilder/query/QueryBuilder';
import { FetchReportQuery } from '../../../types';
import { ReqContext } from '../../../reportBuilder/context';

describe('QueryBuilder', () => {
  const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

  const HIERARCHY = 'explore';
  const ENTITIES = {
    explore: [
      { code: 'explore', country_code: null, type: 'project' },
      { code: 'TO', country_code: 'TO', type: 'country' },
      { code: 'WS', country_code: 'WS', type: 'country' },
      { code: 'KI', country_code: 'KI', type: 'country' },
      { code: 'MY', country_code: 'MY', type: 'country' },
      { code: 'PG', country_code: 'PG', type: 'country' },
      { code: 'PG_District', country_code: 'PG', type: 'district' },
      { code: 'PG_Facility', country_code: 'PG', type: 'facility' },
    ],
    underwater_world: [
      { code: 'underwater_world', country_code: null, type: 'project' },
      { code: 'AQUA_LAND', country_code: 'AQUA_LAND', type: 'country' },
    ],
  };
  const RELATIONS = {
    explore: [
      { parent: 'explore', child: 'TO' },
      { parent: 'explore', child: 'WS' },
      { parent: 'explore', child: 'KI' },
      { parent: 'explore', child: 'MY' },
      { parent: 'explore', child: 'PG' },
      { parent: 'PG', child: 'PG_District' },
      { parent: 'PG_District', child: 'PG_Facility' },
    ],
    underwater_world: [{ parent: 'underwater_world', child: 'AQUA_LAND' }],
  };

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Admin',
    services: new MockTupaiaApiClient({ entity: new MockEntityApi(ENTITIES, RELATIONS) }),
    accessPolicy: new AccessPolicy({
      PG: ['Admin'],
      TO: ['Admin'],
      WS: ['Admin'],
      explore: ['Admin'],
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
    period: getPeriodString([2017, 1], [2020, 12, 15]),
    startDate: '2017-01-01',
    endDate: '2020-12-15',
    ...input,
  });

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getPeriodString = (
    [startYear, startMonth, startDay = 1]: [number, number, number?],
    [endYear, endMonth, endDay = daysInMonth(endMonth, endYear)]: [number, number, number?],
  ) => {
    const periods = [];

    for (let year = startYear; year <= endYear; year++) {
      const isStartYear = year === startYear;
      const isEndYear = year === endYear;
      for (
        let month = year === startYear ? startMonth : 1;
        month <= (year === endYear ? endMonth : 12);
        month++
      ) {
        const isStartMonth = isStartYear && month === startMonth && startDay > 1;
        const isEndMonth =
          isEndYear && month === endMonth && endDay < daysInMonth(endMonth, endYear);
        if (isStartMonth || isEndMonth) {
          for (
            let day = isStartMonth ? startDay : 1;
            day <= (isEndMonth ? endDay : daysInMonth(month, year));
            day++
          )
            periods.push(
              `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`,
            );
        } else {
          periods.push(`${year}${month.toString().padStart(2, '0')}`);
        }
      }
    }
    const periodString = periods.join(';');
    return periodString;
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
            period: `${getPeriodString([2020, 1], [2020, 6, 2])}`,
            startDate: '2020-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'startDate is empty, period is empty - uses default start period',
          { query: inputQuery({ endDate: '2020-06-02' }) },
          outputQuery({
            period: `${getPeriodString([2017, 1], [2020, 6, 2])}`,
            startDate: '2017-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'endDate is empty, period is empty - uses default end period',
          { query: inputQuery({ startDate: '2020-01-01' }) },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 12, 15]),
            startDate: '2020-01-01',
            endDate: '2020-12-15',
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
        [
          'startDate and endDates are different days in different months of the same year',
          { query: inputQuery({ startDate: '2020-01-13', endDate: '2020-09-30' }) },
          outputQuery({
            period: getPeriodString([2020, 1, 13], [2020, 9, 30]),
            startDate: '2020-01-13',
            endDate: '2020-09-30',
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
            period: getPeriodString([2020, 1], [2020, 12, 15]),
            startDate: '2020-01-01',
            endDate: '2020-12-15',
          }),
        ],
        [
          'startDate string specs - overrides not empty query.startDate',
          {
            config: { fetch: { startDate: '2020-01-01' } },
            query: inputQuery({ startDate: '2020-03-05' }),
          },
          outputQuery({
            period: getPeriodString([2020, 1], [2020, 12, 15]),
            startDate: '2020-01-01',
            endDate: '2020-12-15',
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
          'startDate object specs - applies offset to startDate to calculate startDate',
          {
            config: { fetch: { startDate: { unit: 'year', offset: '-2' } } },
            query: inputQuery({
              startDate: '2020-05-01',
              endDate: '2020-10-01',
            }),
          },
          outputQuery({
            period: `${getPeriodString([2018, 5], [2020, 9])};20201001`,
            startDate: '2018-05-01',
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
              startDate: '2019-05-06',
              endDate: '2020-10-01',
            }),
          },
          outputQuery({
            period: `${getPeriodString([2017, 1], [2019, 12])}`,
            startDate: '2017-01-01',
            endDate: '2019-12-31',
          }),
        ],
        [
          'endDate is end of yesterday',
          {
            config: {
              fetch: {
                endDate: {
                  unit: 'day',
                  offset: '-1',
                },
              },
            },
            query: inputQuery(),
          },
          outputQuery({
            endDate: '2020-12-14',
            period: `${getPeriodString([2017, 1], [2020, 12, 14])}`,
          }),
        ],
        [
          'endDate and startDate are yesterday',
          {
            config: {
              fetch: {
                startDate: {
                  from: 'today',
                  unit: 'day',
                  offset: '-1',
                },
                endDate: {
                  unit: 'day',
                  offset: '-1',
                },
              },
            },
            query: inputQuery({}),
          },
          outputQuery({
            endDate: '2020-12-14',
            period: `${getPeriodString([2020, 12, 14], [2020, 12, 14])}`,
            startDate: '2020-12-14',
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

    describe('error cases', () => {
      type TestParams = [
        string,
        { config: { fetch: Record<string, unknown> }; query: FetchReportQuery },
        string | null,
      ];

      const testData: TestParams[] = [
        [
          'throws error if no organisation units requested',
          {
            config: { fetch: {} },
            query: inputQuery({ organisationUnitCodes: [] }),
          },
          "Must provide 'organisationUnitCodes' URL parameter, or 'organisationUnits' in fetch config",
        ],
        [
          'throws error if no organisation units found with requested codes',
          {
            config: { fetch: {} },
            query: inputQuery({ organisationUnitCodes: ['fake_code'] }),
          },
          "No 'Admin' access to any one of entities: fake_code",
        ],
        [
          'throws error if no organisation units found with config codes',
          {
            config: { fetch: { organisationUnits: ['fake_code', 'faker_code'] } },
            query: inputQuery(),
          },
          "No 'Admin' access to any one of entities: fake_code,faker_code",
        ],
        [
          'throws error if no organisation units with permission for requested codes',
          {
            config: { fetch: {} },
            query: inputQuery({ organisationUnitCodes: ['KI'] }),
          },
          "No 'Admin' access to any one of entities: KI",
        ],
        [
          'throws error if no organisation units found with config codes',
          {
            config: { fetch: { organisationUnits: ['MY'] } },
            query: inputQuery(),
          },
          "No 'Admin' access to any one of entities: MY",
        ],
        [
          'throws error if no country organisation units found with project config codes',
          {
            config: { fetch: { organisationUnits: ['underwater_world'] } },
            query: inputQuery({ hierarchy: 'underwater_world' }),
          },
          "No 'Admin' access to any one of entities: underwater_world",
        ],
      ];

      it.each(testData)('%s', async (_, { config, query }, expectedError) => {
        const fullConfig = { transform: [], ...config };
        const build = async () => {
          await new QueryBuilder(reqContext, fullConfig, query).build();
        };
        if (expectedError) {
          await expect(build()).rejects.toThrow(expectedError);
        } else {
          await expect(build()).rejects.not.toThrow();
        }
      });
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
          'uses provided non-country organisation unit codes if have access',
          {
            config: { fetch: { organisationUnits: ['PG_District', 'PG_Facility'] } },
            query: inputQuery(),
          },
          outputQuery({
            organisationUnitCodes: ['PG_District', 'PG_Facility'],
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
          'all countries with access included if organisationUnit is project',
          {
            config: { fetch: { organisationUnits: ['explore'] } },
            query: inputQuery({ organisationUnitCodes: ['PG_Facility'] }),
          },
          outputQuery({
            organisationUnitCodes: ['TO', 'WS', 'PG'],
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
        [
          'all countries with access included if requested organisation unit is project',
          {
            config: { fetch: { organisationUnits: ['$requested', 'PG_Facility'] } },
            query: inputQuery({ organisationUnitCodes: ['explore'] }),
          },
          outputQuery({
            organisationUnitCodes: ['TO', 'WS', 'PG', 'PG_Facility'],
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
