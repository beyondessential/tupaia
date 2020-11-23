/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticConfig, buildArithmetic } from '../../../builders/buildArithmetic';
import { Aggregation, AnalyticValue, Indicator } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_FIXTURES, PARAMETER_ANALYTICS } from './buildArithmetic.fixtures';

describe('buildArithmetic', () => {
  const getDummyApi = () => ({
    getAggregator: () => createAggregator(),
    buildAnalyticsForIndicators: async () => [],
  });

  describe('throws for invalid config', () => {
    const api = getDummyApi();
    const testData: [string, Record<string, unknown>, RegExp | string][] = [
      ['undefined formula', { aggregation: {} }, /Error .*formula.* empty/],
      ['formula is not a string', { formula: {}, aggregation: {} }, /Error .*formula.* string/],
      [
        'undefined aggregation',
        { formula: 'A + B' },
        'must be one of (string | { type: string }), or an array of those types',
      ],
      [
        'null aggregation',
        { formula: 'A + B', aggregation: null },
        'must be one of (string | { type: string }), or an array of those types',
      ],
      [
        'wrong aggregation type',
        { formula: 'A + B', aggregation: true },
        'must be one of (string | { type: string }), or an array of those types',
      ],
      ['empty aggregation string', { formula: 'A + B', aggregation: '' }, 'must not be empty'],
      [
        'aggregation object without type',
        { formula: 'A + B', aggregation: { config: { periodType: 'month' } } },
        'no aggregation defined',
      ],
      [
        'aggregation object with wrong type',
        { formula: 'A + B', aggregation: { type: true } },
        'non empty string',
      ],
      [
        'aggregation object with empty type',
        { formula: 'A + B', aggregation: { type: '' } },
        'non empty string',
      ],
      [
        'aggregation array item is invalid',
        { formula: 'A + B', aggregation: ['SUM', ''] },
        /item #2.* must not be empty/,
      ],
      [
        'aggregation dictionary value is invalid',
        { formula: 'A + B', aggregation: { A: 'SUM', B: '' } },
        /key 'B'.* must not be empty/,
      ],
      [
        'a data element referenced in the formula has no defined aggregation',
        { formula: 'A + B', aggregation: { A: 'MOST_RECENT' } },
        /B.* has no aggregation defined/,
      ],
      [
        'default values is not a plain object',
        {
          formula: 'A + B',
          aggregation: { A: 'MOST_RECENT', B: 'SUM' },
          defaultValues: [{ C: 10 }],
        },
        /defaultValues.* not a plain javascript object/i,
      ],
      [
        'a data element not referenced in the formula has a default',
        {
          formula: 'A + B',
          aggregation: { A: 'MOST_RECENT', B: 'SUM' },
          defaultValues: { C: 10 },
        },
        /C.* is in defaultValues but not referenced in the formula/,
      ],
      [
        'a default value must be a number',
        { formula: 'A + 1', aggregation: { A: 'SUM' }, defaultValues: { A: '10' } },
        /Value 'A' is not a number: '10'/,
      ],
      [
        'parameters must be an array of objects',
        {
          formula: 'A + 1',
          aggregation: { A: 'SUM' },
          parameters: { code: 'A', builder: 'arithmetic', config: {} },
        },
        /parameters.* should contain an array/i,
      ],
      [
        'all parameters should have an indicator shape',
        {
          formula: 'A + 1',
          aggregation: { A: 'SUM' },
          parameters: [
            { code: 'A', builder: 'arithmetic', config: {} },
            { code: 'A', config: {} },
          ],
        },
        /parameters.* .*builder.* .*should not be empty/i,
      ],
    ];

    it.each(testData)('%s', async (_, config, expectedError) =>
      expect(buildArithmetic({ api, config, fetchOptions: {} })).toBeRejectedWith(expectedError),
    );
  });

  describe('resolves for valid config', () => {
    const api = getDummyApi();
    const codesToParameters = (codes: string[]) =>
      codes.map(code => ({ code, builder: 'testAnalytic', config: {} }));

    const testData: [string, ArithmeticConfig][] = [
      [
        'single aggregation - string',
        {
          formula: '2 * A + B',
          aggregation: 'MOST_RECENT',
        },
      ],
      [
        'single aggregation - object without config',
        {
          formula: '2 * A + B',
          aggregation: { type: 'FINAL_EACH_WEEK' },
        },
      ],
      [
        'single aggregation - object with config',
        {
          formula: '2 * A + B',
          aggregation: { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
        },
      ],
      [
        'single aggregation - array',
        {
          formula: '2 * A + B',
          aggregation: [
            { type: 'FINAL_EACH_WEEK' },
            'SUM',
            { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
          ],
        },
      ],
      [
        'multiple aggregations - multiple types',
        {
          formula: '2 * A + B + C + D',
          aggregation: {
            A: 'MOST_RECENT',
            B: { type: 'MOST_RECENT' },
            C: { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            D: [
              { type: 'FINAL_EACH_WEEK' },
              'SUM',
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        },
      ],
      [
        'formula includes parameter',
        {
          formula: '2 * A + B',
          aggregation: { A: 'MOST_RECENT' },
          parameters: codesToParameters(['B']),
        },
      ],
      [
        'formula consists of parameters',
        {
          formula: '2 * A + B',
          aggregation: {},
          parameters: codesToParameters(['A', 'B']),
        },
      ],
    ];

    it.each(testData)('%s', (_, config) => {
      return expect(buildArithmetic({ api, config, fetchOptions: {} })).toResolve();
    });
  });

  describe('calls `aggregator.fetchAnalytics` with correct element codes and aggregations', () => {
    const aggregator = createAggregator();
    const api = {
      getAggregator: () => aggregator,
      buildAnalyticsForIndicators: async () => [],
    };

    type FetchAnalyticsParams = { codes: string[]; aggregations: Aggregation[] };

    const testData: [string, ArithmeticConfig, FetchAnalyticsParams[]][] = [
      [
        'single aggregation - string',
        {
          formula: 'BCD1 + BCD2',
          aggregation: 'FINAL_EACH_WEEK',
        },
        [{ codes: ['BCD1', 'BCD2'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] }],
      ],
      [
        'single aggregation - object without config',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { type: 'FINAL_EACH_WEEK' },
        },
        [{ codes: ['BCD1', 'BCD2'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] }],
      ],
      [
        'single aggregation - object with config',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
        },
        [
          {
            codes: ['BCD1', 'BCD2'],
            aggregations: [{ type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } }],
          },
        ],
      ],
      [
        'single aggregation - array',
        {
          formula: 'BCD1 + BCD2',
          aggregation: [
            'MOST_RECENT',
            { type: 'FINAL_EACH_WEEK' },
            { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
          ],
        },
        [
          {
            codes: ['BCD1', 'BCD2'],
            aggregations: [
              { type: 'MOST_RECENT' },
              { type: 'FINAL_EACH_WEEK' },
              { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
            ],
          },
        ],
      ],
      [
        'multiple aggregations - strings',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { BCD1: 'FINAL_EACH_WEEK', BCD2: 'SUM' },
        },
        [
          { codes: ['BCD1'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] },
          { codes: ['BCD2'], aggregations: [{ type: 'SUM' }] },
        ],
      ],
      [
        'multiple aggregations - multiple types',
        {
          formula: 'BCD1 + BCD1a + BCD2 + BCD3 + BCD4 + BCD4a + BCD5 + BCD6',
          aggregation: {
            BCD1: 'MOST_RECENT',
            BCD1a: { type: 'MOST_RECENT' },
            BCD2: 'SUM',
            BCD3: { type: 'SUM', config: { periodType: 'week', offset: 1 } },

            BCD4: ['FINAL_EACH_WEEK', 'SUM'],
            BCD4a: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
            BCD5: ['FINAL_EACH_WEEK', 'COUNT'],

            BCD6: [
              { type: 'FINAL_EACH_WEEK' },
              'SUM',
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        },
        [
          { codes: ['BCD1', 'BCD1a'], aggregations: [{ type: 'MOST_RECENT' }] },
          { codes: ['BCD2'], aggregations: [{ type: 'SUM' }] },
          {
            codes: ['BCD3'],
            aggregations: [{ type: 'SUM', config: { periodType: 'week', offset: 1 } }],
          },
          {
            codes: ['BCD4', 'BCD4a'],
            aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
          },
          {
            codes: ['BCD5'],
            aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'COUNT' }],
          },
          {
            codes: ['BCD6'],
            aggregations: [
              { type: 'FINAL_EACH_WEEK' },
              { type: 'SUM' },
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        ],
      ],
    ];

    it.each(testData)('%s', async (_, config, expectedCallArgs) => {
      await buildArithmetic({ api, config, fetchOptions: {} });

      expect(aggregator.fetchAnalytics).toHaveBeenCalledTimes(expectedCallArgs.length);
      expectedCallArgs.forEach(({ codes, aggregations }) => {
        expect(aggregator.fetchAnalytics).toHaveBeenCalledWith(codes, expect.anything(), {
          aggregations,
        });
      });
    });
  });

  it('calls `aggregator.fetchAnalytics` with `fetchOptions`', async () => {
    const aggregator = createAggregator();
    const api = {
      getAggregator: () => aggregator,
      buildAnalyticsForIndicators: async () => [],
    };
    const config = {
      formula: 'A + B',
      aggregation: { A: 'MOST_RECENT', B: 'MOST_RECENT' },
    };
    const fetchOptions = { organisationUnitCodes: ['TO'] };
    await buildArithmetic({ api, config, fetchOptions });

    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      expect.anything(),
      fetchOptions,
      expect.anything(),
    );
  });

  describe('calculations for a single orgUnit/period combo', () => {
    const api = {
      getAggregator: () => createAggregator(ANALYTIC_RESPONSE_FIXTURES),
      buildAnalyticsForIndicators: async () => [],
    };

    const testData: [string, ArithmeticConfig, AnalyticValue[]][] = [
      [
        'simple calculation - integer',
        {
          formula: 'A_To_2019 + B_To_2019',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [{ organisationUnit: 'TO', period: '2019', value: 3 }],
      ],
      [
        'simple calculation - float',
        {
          formula: 'A_To_2019 / B_To_2019',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [{ organisationUnit: 'TO', period: '2019', value: 0.5 }],
      ],
      [
        'complex calculation',
        {
          formula: '((A_To_2019 + B_To_2019) * C_To_2019) / (D_To_2019 - E_To_2019)',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [{ organisationUnit: 'TO', period: '2019', value: -9 }],
      ],
      [
        'division with zero',
        {
          formula: 'A_To_2019 / (A_To_2019 + B_To_2019 - C_To_2019)',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [],
      ],
      [
        'some data elements are undefined in the orgUnit/period combo',
        {
          formula: 'A_To_2020 + Undefined_To_2019',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [],
      ],
    ];

    it.each(testData)('%s', (_, config, expected) =>
      expect(buildArithmetic({ api, config, fetchOptions: {} })).resolves.toIncludeSameMembers(
        expected,
      ),
    );
  });

  describe('calculations for multiple orgUnit/period combos', () => {
    const api = {
      getAggregator: () => createAggregator(ANALYTIC_RESPONSE_FIXTURES),
      buildAnalyticsForIndicators: async () => [],
    };

    const testData: [string, ArithmeticConfig, AnalyticValue[]][] = [
      [
        'all data elements are defined in all combos',
        {
          formula: 'A_ToPg_20192020 + B_ToPg_20192020',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 3 },
          { organisationUnit: 'TO', period: '2020', value: 30 },
          { organisationUnit: 'PG', period: '2019', value: 3.3000000000000003 },
          { organisationUnit: 'PG', period: '2020', value: 33 },
        ],
      ],
      [
        'some data elements are undefined in some periods',
        {
          formula: 'A_ToPg_20192020 + C_ToPg_2019',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 4 },
          { organisationUnit: 'PG', period: '2019', value: 4.4 },
        ],
      ],
      [
        'some data elements are undefined in some org units',
        {
          formula: 'A_ToPg_20192020 + D_To_20192020',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 5 },
          { organisationUnit: 'TO', period: '2020', value: 50 },
        ],
      ],
      [
        'all combos include an undefined data element',
        {
          formula: 'C_ToPg_2019 + D_To_20192020 + E_Pg_20192020',
          aggregation: 'FINAL_EACH_YEAR',
        },
        [],
      ],
      [
        'some combos include an undefined data element, but all defaults defined',
        {
          formula: 'C_ToPg_2019 + E_Pg_20192020',
          aggregation: 'FINAL_EACH_YEAR',
          defaultValues: {
            C_ToPg_2019: 10,
            E_Pg_20192020: 100,
          },
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 103 },
          { organisationUnit: 'PG', period: '2019', value: 8.8 },
          { organisationUnit: 'PG', period: '2020', value: 65 },
        ],
      ],
      [
        'some combos include an undefined data element, but not all defaults defined',
        {
          formula: 'C_ToPg_2019 + E_Pg_20192020',
          aggregation: 'FINAL_EACH_YEAR',
          defaultValues: {
            C_ToPg_2019: 10,
          },
        },
        [
          { organisationUnit: 'PG', period: '2019', value: 8.8 },
          { organisationUnit: 'PG', period: '2020', value: 65 },
        ],
      ],
      [
        "defaults don't replace 0s",
        {
          formula: 'Z_To_2019 * 2',
          aggregation: 'FINAL_EACH_YEAR',
          defaultValues: {
            Z_To_2019: 10,
          },
        },
        [{ organisationUnit: 'TO', period: '2019', value: 0 }],
      ],
    ];

    it.each(testData)('%s', (_, config, expected) =>
      expect(buildArithmetic({ api, config, fetchOptions: {} })).resolves.toIncludeSameMembers(
        expected,
      ),
    );
  });

  describe('intermediary calculations (`parameters` field)', () => {
    const aggregator = createAggregator(ANALYTIC_RESPONSE_FIXTURES);
    const api = {
      getAggregator: () => aggregator,
      buildAnalyticsForIndicators: jest.fn(async (indicators: Indicator[]) => {
        const indicatorCodes = indicators.map(i => i.code);
        return PARAMETER_ANALYTICS.filter(a => indicatorCodes.includes(a.dataElement));
      }),
    };
    const PARAMETERS = {
      Positive_Cases: {
        code: '_Positive_Cases',
        builder: 'testAnalyticCount',
        config: {
          formula: "Result = 'Positive'",
          aggregation: 'FINAL_EACH_WEEK',
        },
      },
      Total_Consultations: {
        code: '_Total_Consultations',
        builder: 'testArithmetic',
        config: {
          formula: 'Male_Consultations + Female_Consultations',
          aggregation: 'FINAL_EACH_WEEK',
        },
      },
    };
    const fetchOptions = { organisationUnitCodes: ['TO'] };

    it('formula consists of parameters', async () => {
      const parameters = [PARAMETERS.Positive_Cases, PARAMETERS.Total_Consultations];
      const config = {
        formula: '_Positive_Cases / _Total_Consultations',
        parameters,
        aggregation: {},
      };

      await expect(buildArithmetic({ api, config, fetchOptions })).resolves.toIncludeSameMembers([
        { organisationUnit: 'TO', period: '2019', value: 0.4 },
        { organisationUnit: 'TO', period: '2020', value: 0.3 },
      ]);
      expect(api.buildAnalyticsForIndicators).toHaveBeenCalledOnceWith(parameters, fetchOptions);
      expect(aggregator.fetchAnalytics).not.toHaveBeenCalled();
    });

    it('formula consists of parameters and data sources', async () => {
      const parameters = [PARAMETERS.Positive_Cases];
      const config = {
        formula: '_Positive_Cases / Population',
        parameters,
        aggregation: 'FINAL_EACH_YEAR',
      };

      await expect(buildArithmetic({ api, config, fetchOptions })).resolves.toIncludeSameMembers([
        { organisationUnit: 'TO', period: '2019', value: 0.1 },
        { organisationUnit: 'TO', period: '2020', value: 0.2 },
      ]);
      expect(api.buildAnalyticsForIndicators).toHaveBeenCalledOnceWith(parameters, fetchOptions);
      expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
        ['Population'],
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
