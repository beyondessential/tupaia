/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticConfig, buildArithmetic } from '../../../builders/buildArithmetic';
import { AnalyticValue } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_FIXTURES } from './buildArithmetic.fixtures';

export const testCalculations = () => {
  describe('arithmetic', () => {
    const api = {
      getAggregator: () => createAggregator(ANALYTIC_RESPONSE_FIXTURES),
      buildAnalyticsForIndicators: async () => [],
    };

    const testData: [string, string, number[]][] = [
      ['simple expression - integer result', 'One + Two', [3]],
      ['simple expression - float result', 'One / Two', [1 / 2]],
      ['complex expression', '((One + Two) * Three) / (Four - Five)', [((1 + 2) * 3) / (4 - 5)]],
      ['division with zero', 'One / (One + Two - Three)', []],
      ['some data elements are undefined in the orgUnit/period combo', 'One + Undefined', []],
    ];

    it.each(testData)('%s', (_, formula, expected) => {
      const config = { formula, aggregation: 'FINAL_EACH_YEAR' };

      return expect(
        buildArithmetic({ api, config, fetchOptions: {} }),
      ).resolves.toIncludeSameMembers(
        expected.map(value => ({ organisationUnit: 'TO', period: '2019', value })),
      );
    });
  });

  describe('boolean', () => {
    const api = {
      getAggregator: () => createAggregator(ANALYTIC_RESPONSE_FIXTURES),
      buildAnalyticsForIndicators: async () => [],
    };

    const testData: [string, string, number[]][] = [
      ['> (true)', 'Two > One', [1]],
      ['> (false)', 'One > Two', [0]],
      ['= (true)', 'Zero == Zero', [1]],
      ['= (false)', 'Zero == One', [0]],
      ['< (true)', 'Two < Five', [1]],
      ['< (false)', 'Five < Two', [0]],
      ['and (true)', '(Two > One) and (Two < Three)', [1]],
      ['and (false)', '(Two > One) and (Two > Three)', [0]],
      ['or (true)', '(Two == One) or (Two < Three)', [1]],
      ['or (false)', '(Two == One) or (Two > Three)', [0]],
      [
        'complex expression - comparisons',
        '((Two + One) / (Five)) > ((One + One) / (Three))',
        // eslint-disable-next-line no-constant-condition
        [(2 + 1) / 5 > (1 + 1) / 3 ? 1 : 0],
      ],
      [
        'complex expression - boolean operators',
        '(Three < Two) or ((Two > One) and not (Two > Five))',
        // eslint-disable-next-line no-constant-condition
        [3 < 2 || (2 > 1 && !(2 > 5)) ? 1 : 0],
      ],
      [
        'complex expression - boolean operators',
        '(Three < 4 / 2) or ((Two > 1) and not (Two > (2 + 3)))',
        // eslint-disable-next-line no-constant-condition, yoda
        [3 < 4 / 2 || (2 > 1 && !(2 > 2 + 3)) ? 1 : 0],
      ],
    ];

    it.each(testData)('%s', (_, formula, expected) => {
      const config = { formula, aggregation: 'FINAL_EACH_YEAR' };

      return expect(
        buildArithmetic({ api, config, fetchOptions: {} }),
      ).resolves.toIncludeSameMembers(
        expected.map(value => ({ organisationUnit: 'TO', period: '2019', value })),
      );
    });
  });

  describe('multiple orgUnit/period combos', () => {
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
          formula: 'Zero * 2',
          aggregation: 'FINAL_EACH_YEAR',
          defaultValues: {
            Zero: 10,
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
};
