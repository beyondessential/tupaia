/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import MockDate from 'mockdate';

import { QueryBuilder } from '../../../reportBuilder/query/QueryBuilder';
import { FetchReportQuery } from '../../../types';

describe('QueryBuilder', () => {
  /**
   * Fills the query with the minimum required fields,
   * so that the tests can focus on the specific fields under test
   */
  const fullQuery = (input: Partial<FetchReportQuery> = {}) => ({
    organisationUnitCodes: ['TO'],
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

  it('handles all supported params', () => {
    const config = { fetch: { dataElements: ['DE'] }, transform: [] };
    const query = {
      organisationUnitCodes: ['TO'],
      hierarchy: 'explore',
      period: getPeriodString([2020, 1], [2020, 12]),
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    };

    const builtQuery = new QueryBuilder(config, query);
    expect(builtQuery).toStrictEqual(builtQuery);
  });

  describe('period params', () => {
    const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

    beforeAll(() => {
      MockDate.set(CURRENT_DATE_STUB);
    });

    afterAll(() => {
      MockDate.reset();
    });

    describe('no date specs in config', () => {
      type TestParams = [string, { query: FetchReportQuery }, FetchReportQuery];

      const testData: TestParams[] = [
        [
          'empty params - uses the default period',
          { query: fullQuery() },
          fullQuery({
            period: getPeriodString([2017, 1], [2020, 12]),
            startDate: '2017-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate and endDate are provided - period is adjusted to them',
          { query: fullQuery({ startDate: '2020-01-01', endDate: '2020-06-02' }) },
          fullQuery({
            period: `${getPeriodString([2020, 1], [2020, 5])};20200601;20200602`,
            startDate: '2020-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'startDate is empty, period is empty - uses default start period',
          { query: fullQuery({ endDate: '2020-06-02' }) },
          fullQuery({
            period: `${getPeriodString([2017, 1], [2020, 5])};20200601;20200602`,
            startDate: '2017-01-01',
            endDate: '2020-06-02',
          }),
        ],
        [
          'endDate is empty, period is empty - uses default end period',
          { query: fullQuery({ startDate: '2020-01-01' }) },
          fullQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate and endDate are empty - uses start and end period',
          { query: fullQuery({ period: getPeriodString([2020, 1], [2020, 6]) }) },
          fullQuery({
            period: getPeriodString([2020, 1], [2020, 6]),
            startDate: '2020-01-01',
            endDate: '2020-06-30',
          }),
        ],
      ];

      it.each(testData)('%s', (_, { query }, expected) => {
        const config = { fetch: { dataElements: ['DE'] }, transform: [] };
        const received = new QueryBuilder(config, query).build();
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
            query: fullQuery(),
          },
          fullQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate string specs - overrides not empty query.startDate',
          {
            config: { fetch: { startDate: '2020-01-01' } },
            query: fullQuery({ startDate: '2020-03-05' }),
          },
          fullQuery({
            period: getPeriodString([2020, 1], [2020, 12]),
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'endDate string specs - uses it if query.endDate is empty',
          {
            config: { fetch: { endDate: '2020-12-31' } },
            query: fullQuery(),
          },
          fullQuery({
            period: getPeriodString([2017, 1], [2020, 12]),
            startDate: '2017-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'endDate string specs - overrides not empty query.endDate',
          {
            config: { fetch: { endDate: '2020-12-31' } },
            query: fullQuery({ endDate: '2020-10-05' }),
          },
          fullQuery({
            period: getPeriodString([2017, 1], [2020, 12]),
            startDate: '2017-01-01',
            endDate: '2020-12-31',
          }),
        ],
        [
          'startDate object specs - applies offset to endDate to calculate startDate',
          {
            config: { fetch: { startDate: { unit: 'year', offset: '-2' } } },
            query: fullQuery({
              startDate: '2020-05-06', // will be ignored - (offset is applied on top of endDate)
              endDate: '2020-10-01',
            }),
          },
          fullQuery({
            period: `${getPeriodString([2018, 10], [2020, 9])};20201001`,
            startDate: '2018-10-01',
            endDate: '2020-10-01',
          }),
        ],
        [
          'endDate object specs - applies offset to endDate to calculate endDate',
          {
            config: { fetch: { endDate: { unit: 'year', offset: '+2' } } },
            query: fullQuery({ startDate: '2020-01-01', endDate: '2020-06-03' }),
          },
          fullQuery({
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
            query: fullQuery({
              startDate: '2020-05-06', // will be ignored - (offset is applied on top of endDate)
              endDate: '2020-10-01',
            }),
          },
          fullQuery({
            period: `${getPeriodString([2018, 1], [2019, 12])}`,
            startDate: '2018-01-01',
            endDate: '2019-12-31',
          }),
        ],
      ];

      it.each(testData)('%s', (_, { config, query }, expected) => {
        const fullConfig = { transform: [], ...config };
        const received = new QueryBuilder(fullConfig, query).build();
        expect(received).toStrictEqual(expected);
      });
    });
  });
});
