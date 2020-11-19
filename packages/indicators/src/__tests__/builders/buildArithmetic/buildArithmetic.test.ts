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
    const testData: [string, Record<string, unknown>, RegExp][] = [
      ['undefined formula', { aggregation: {} }, /Error .*formula.* empty/],
      ['formula is not a string', { formula: {}, aggregation: {} }, /Error .*formula.* string/],
      ['undefined aggregation', { formula: 'A + B' }, /Error .*aggregation.* empty/],
      [
        'wrong aggregation type',
        { formula: 'A + B', aggregation: ['MOST_RECENT'] },
        /must be one of string \| object/i,
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
        'string aggregation',
        {
          formula: '2 * A + B',
          aggregation: 'MOST_RECENT',
        },
      ],
      [
        'object aggregation',
        {
          formula: '2 * A + B',
          aggregation: { A: 'MOST_RECENT', B: ['SUM', 'MOST_RECENT'] },
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
        'string',
        {
          formula: 'BCD01 + BCD02',
          aggregation: 'FINAL_EACH_WEEK',
        },
        [{ codes: ['BCD01', 'BCD02'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] }],
      ],
      [
        'object with string values',
        {
          formula: 'BCD01 + BCD02',
          aggregation: { BCD01: 'FINAL_EACH_WEEK', BCD02: 'SUM' },
        },
        [
          { codes: ['BCD01'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] },
          { codes: ['BCD02'], aggregations: [{ type: 'SUM' }] },
        ],
      ],
      [
        'object with string[] values',
        {
          formula: 'BCD01 + BCD02',
          aggregation: { BCD01: ['FINAL_EACH_WEEK', 'SUM'], BCD02: ['FINAL_EACH_WEEK', 'COUNT'] },
        },
        [
          { codes: ['BCD01'], aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }] },
          { codes: ['BCD02'], aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'COUNT' }] },
        ],
      ],
      [
        'object with mixed string and string[] values',
        {
          formula: 'BCD01 + BCD02',
          aggregation: { BCD01: ['FINAL_EACH_WEEK', 'SUM'], BCD02: ['FINAL_EACH_WEEK'] },
        },
        [
          { codes: ['BCD01'], aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }] },
          { codes: ['BCD02'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] },
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
      aggregation: { A: ['MOST_RECENT'], B: ['MOST_RECENT'] },
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
      expect(aggregator.fetchAnalytics).toHaveBeenCalledTimes(1);
    });
  });
});
