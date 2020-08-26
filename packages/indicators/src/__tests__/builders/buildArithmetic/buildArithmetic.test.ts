/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticConfig, buildArithmetic } from '../../../builders/buildArithmetic';
import { AnalyticValue } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_FIXTURES } from './buildArithmetic.fixtures';

const aggregationsByCode = (codes: string[]) =>
  Object.fromEntries(codes.map(code => [code, ['FINAL_EACH_YEAR']]));

describe('buildArithmetic', () => {
  const aggregator = createAggregator(ANALYTIC_RESPONSE_FIXTURES);

  it('throws an error if a data element referenced in the formula has no defined aggregation', async () => {
    const config = { formula: 'A + B', aggregation: { A: 'MOST_RECENT' } };
    return expect(buildArithmetic({ aggregator, config, fetchOptions: {} })).toBeRejectedWith(
      /B.* has no aggregation defined/,
    );
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
          formula: 'A_TO_2019 + B_TO_2019',
          aggregation: aggregationsByCode(['A_TO_2019', 'B_TO_2019']),
        },
        [{ organisationUnit: 'TO', period: '2019', value: 3 }],
      ],
      [
        'simple calculation - float',
        {
          formula: 'A_TO_2019 / B_TO_2019',
          aggregation: aggregationsByCode(['A_TO_2019', 'B_TO_2019']),
        },
        [{ organisationUnit: 'TO', period: '2019', value: 0.5 }],
      ],
      [
        'complex calculation',
        {
          formula: '((A_TO_2019 + B_TO_2019) * C_TO_2019) / (D_TO_2019 - E_TO_2019)',
          aggregation: aggregationsByCode([
            'A_TO_2019',
            'B_TO_2019',
            'C_TO_2019',
            'D_TO_2019',
            'E_TO_2019',
          ]),
        },
        [{ organisationUnit: 'TO', period: '2019', value: -9 }],
      ],
      [
        'division with zero',
        {
          formula: 'A_TO_2019 / (A_TO_2019 + B_TO_2019 - C_TO_2019)',
          aggregation: aggregationsByCode(['A_TO_2019', 'B_TO_2019', 'C_TO_2019']),
        },
        [{ organisationUnit: 'TO', period: '2019', value: Infinity }],
      ],
      [
        'some data elements are undefined in the orgUnit/period combo',
        {
          formula: 'A_TO_2020 + UNDEFINED_TO_2019',
          aggregation: aggregationsByCode(['A_TO_2020', 'UNDEFINED_TO_2019']),
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
          formula: 'A_TOPG_201920 + B_TOPG_201920',
          aggregation: aggregationsByCode(['A_TOPG_201920', 'B_TOPG_201920']),
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
          formula: 'A_TOPG_201920 + C_TOPG_2019',
          aggregation: aggregationsByCode(['A_TOPG_201920', 'C_TOPG_2019']),
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 4 },
          { organisationUnit: 'PG', period: '2019', value: 4.4 },
        ],
      ],
      [
        'some data elements are undefined in some org units',
        {
          formula: 'A_TOPG_201920 + D_TO_201920',
          aggregation: aggregationsByCode(['A_TOPG_201920', 'D_TO_201920']),
        },
        [
          { organisationUnit: 'TO', period: '2019', value: 5 },
          { organisationUnit: 'TO', period: '2020', value: 50 },
        ],
      ],
      [
        'all combos include an undefined data element',
        {
          formula: 'C_TOPG_2019 + D_TO_201920 + E_PG_201920',
          aggregation: aggregationsByCode(['C_TOPG_2019', 'D_TO_201920', 'E_PG_201920']),
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
});
