/* eslint-disable @typescript-eslint/camelcase */
/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticConfig, buildArithmetic } from '../../../builders/buildArithmetic';
import { AnalyticValue } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_FIXTURES } from './buildArithmetic.fixtures';

const getAggregationForCodes = (codes: string[]) =>
  Object.fromEntries(codes.map(code => [code, ['FINAL_EACH_YEAR']]));

describe('buildArithmetic', () => {
  const aggregator = createAggregator(ANALYTIC_RESPONSE_FIXTURES);

  describe('throws for invalid config', () => {
    const testData: [string, {}, RegExp][] = [
      ['undefined formula', { aggregation: {} }, /Error .*formula.* empty/],
      ['formula is not a string', { formula: {}, aggregation: {} }, /Error .*formula.* string/],
      ['undefined aggregation', { formula: 'A + B' }, /Error .*aggregation.* empty/],
      [
        'aggregation is not an object',
        { formula: 'A + B', aggregation: 'MOST_RECENT' },
        /Error .*aggregation.* object/,
      ],
      [
        'a data element referenced in the formula has no defined aggregation',
        { formula: 'A + B', aggregation: { A: 'MOST_RECENT' } },
        /B.* has no aggregation defined/,
      ],
      [
        'a data element not referenced in the formula but has a default',
        { formula: 'A + B', aggregation: { A: 'MOST_RECENT', B: 'SUM' }, defaultValues: { C: 10 } },
        /C.* is in defaultValues but not referenced in the formula/,
      ],
      [
        'a default value must be a number',
        { formula: 'A + 1', aggregation: { A: 'SUM' }, defaultValues: { A: '10' } },
        /Default value for 'A' is not a number: '10'/,
      ],
    ];

    it.each(testData)('%s', async (_, config, expectedError) =>
      expect(buildArithmetic({ aggregator, config, fetchOptions: {} })).toBeRejectedWith(
        expectedError,
      ),
    );
  });

  it('resolves for valid config', async () => {
    const config = {
      formula: '2 * A + B',
      aggregation: { A: 'MOST_RECENT', B: ['SUM', 'MOST_RECENT'] },
    };
    return expect(buildArithmetic({ aggregator, config, fetchOptions: {} })).toResolve();
  });

  it('calls `aggregator.fetchAnalytics` with `fetchOptions`', async () => {
    const config = {
      formula: 'A + B',
      aggregation: { A: ['MOST_RECENT'], B: ['MOST_RECENT'] },
    };
    const fetchOptions = { organisationUnitCodes: ['TO'] };
    await buildArithmetic({ aggregator, config, fetchOptions });

    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      expect.anything(),
      fetchOptions,
      expect.anything(),
    );
  });

  describe('calculations for a single orgUnit/period combo', () => {
    const testData: [string, ArithmeticConfig, AnalyticValue[]][] = [
      [
        'simple calculation - integer',
        {
          formula: 'A_To_2019 + B_To_2019',
          aggregation: getAggregationForCodes(['A_To_2019', 'B_To_2019']),
        },
        [{ organisationUnit: 'TO', period: '2019', value: 3 }],
      ],
      [
        'simple calculation - float',
        {
          formula: 'A_To_2019 / B_To_2019',
          aggregation: getAggregationForCodes(['A_To_2019', 'B_To_2019']),
        },
        [{ organisationUnit: 'TO', period: '2019', value: 0.5 }],
      ],
      [
        'complex calculation',
        {
          formula: '((A_To_2019 + B_To_2019) * C_To_2019) / (D_To_2019 - E_To_2019)',
          aggregation: getAggregationForCodes([
            'A_To_2019',
            'B_To_2019',
            'C_To_2019',
            'D_To_2019',
            'E_To_2019',
          ]),
        },
        [{ organisationUnit: 'TO', period: '2019', value: -9 }],
      ],
      [
        'division with zero',
        {
          formula: 'A_To_2019 / (A_To_2019 + B_To_2019 - C_To_2019)',
          aggregation: getAggregationForCodes(['A_To_2019', 'B_To_2019', 'C_To_2019']),
        },
        [],
      ],
      [
        'some data elements are undefined in the orgUnit/period combo',
        {
          formula: 'A_To_2020 + Undefined_To_2019',
          aggregation: getAggregationForCodes(['A_To_2020', 'Undefined_To_2019']),
        },
        [],
      ],
    ];

    it.each(testData)('%s', (_, config, expected) =>
      expect(
        buildArithmetic({ aggregator, config, fetchOptions: {} }),
      ).resolves.toIncludeSameMembers(expected),
    );
  });

  describe('calculations for multiple orgUnit/period combos', () => {
    const testData: [string, ArithmeticConfig, AnalyticValue[]][] = [
      [
        'all data elements are defined in all combos',
        {
          formula: 'A_ToPg_20192020 + B_ToPg_20192020',
          aggregation: getAggregationForCodes(['A_ToPg_20192020', 'B_ToPg_20192020']),
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
          aggregation: getAggregationForCodes(['A_ToPg_20192020', 'C_ToPg_2019']),
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
          aggregation: getAggregationForCodes(['A_ToPg_20192020', 'D_To_20192020']),
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
          aggregation: getAggregationForCodes(['C_ToPg_2019', 'D_To_20192020', 'E_Pg_20192020']),
        },
        [],
      ],
      [
        'some combos include an undefined data element, but all defaults defined',
        {
          formula: 'C_ToPg_2019 + E_Pg_20192020',
          aggregation: getAggregationForCodes(['C_ToPg_2019', 'E_Pg_20192020']),
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
          aggregation: getAggregationForCodes(['C_ToPg_2019', 'E_Pg_20192020']),
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
          aggregation: getAggregationForCodes(['Z_To_2019']),
          defaultValues: {
            Z_To_2019: 10,
          },
        },
        [{ organisationUnit: 'TO', period: '2019', value: 0 }],
      ],
    ];

    it.each(testData)('%s', (_, config, expected) =>
      expect(
        buildArithmetic({ aggregator, config, fetchOptions: {} }),
      ).resolves.toIncludeSameMembers(expected),
    );
  });
});
