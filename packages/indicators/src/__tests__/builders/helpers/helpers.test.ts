/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  extractDataElementCodesFromFormula,
  getAggregationsByCode,
  fetchAnalytics,
} from '../../../builders/helpers';
import { Aggregation } from '../../../types';
import { AggregationResponseConfig, AGGREGATION_RESPONSE_CONFIG } from './helpers.fixtures';
import { createAggregator } from './helpers.stubs';

describe('helpers', () => {
  describe('extractDataElementCodesFromFormula()', () => {
    const testData: [string, string, string[]][] = [
      ['single letter codes', 'A + B', ['A', 'B']],
      ['multi letter codes', 'BCD01 + BCD02', ['BCD01', 'BCD02']],
      ['excessive whitespace', ' BCD01  +  BCD02 ', ['BCD01', 'BCD02']],
      ['no whitespace', 'BCD01+BCD02', ['BCD01', 'BCD02']],
      ['same code multiple times', 'BCD01 * BCD02 + BCD01', ['BCD01', 'BCD02']],
      [
        'all symbols',
        '(BCD01 + BCD02) / ((BCD03 * BCD04) - BCD05)',
        ['BCD01', 'BCD02', 'BCD03', 'BCD04', 'BCD05'],
      ],
    ];

    it.each(testData)('%s', (_, formula, expected) => {
      expect(extractDataElementCodesFromFormula(formula)).toEqual(new Set(expected));
    });
  });

  describe('getAggregationsByCode()', () => {
    const testData: [string, Record<string, string | string[]>, Record<string, Aggregation[]>][] = [
      [
        'string values',
        { BCD01: 'FINAL_EACH_WEEK', BCD02: 'FINAL_EACH_WEEK' },
        { BCD01: [{ type: 'FINAL_EACH_WEEK' }], BCD02: [{ type: 'FINAL_EACH_WEEK' }] },
      ],
      [
        'array values',
        { BCD01: ['FINAL_EACH_WEEK', 'SUM'], BCD02: ['FINAL_EACH_WEEK', 'COUNT'] },
        {
          BCD01: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
          BCD02: [{ type: 'FINAL_EACH_WEEK' }, { type: 'COUNT' }],
        },
      ],
      [
        'mixed values',
        { BCD01: ['FINAL_EACH_WEEK', 'SUM'], BCD02: ['FINAL_EACH_WEEK'] },
        {
          BCD01: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
          BCD02: [{ type: 'FINAL_EACH_WEEK' }],
        },
      ],
    ];

    it.each(testData)('%s', (_, aggregationsByCode, expected) => {
      expect(getAggregationsByCode(aggregationsByCode)).toStrictEqual(expected);
    });
  });

  describe('fetchAnalytics()', () => {
    const aggregator = createAggregator(AGGREGATION_RESPONSE_CONFIG);

    it('uses the provided fetchOptions', async () => {
      const fetchOptions = { organisationUnitCodes: ['TO'] };
      await fetchAnalytics(
        aggregator,
        { BCD01: AGGREGATION_RESPONSE_CONFIG.BCD01.expectedAggregations },
        fetchOptions,
      );

      expect(aggregator.fetchAnalytics).toHaveBeenCalledWith(
        expect.anything(),
        fetchOptions,
        expect.anything(),
      );
    });

    describe('grouping fetches by aggregations', () => {
      const testData: [string, (keyof AggregationResponseConfig)[], { value: number }[]][] = [
        ['single data element', ['BCD01'], [{ value: 1 }]],
        [
          'data elements with different aggregations',
          ['BCD01', 'BCD02'],
          [{ value: 1 }, { value: 2 }],
        ],
        [
          'data elements with the same aggregations',
          ['BCD02', 'BCD03'],
          [{ value: 2 }, { value: 3 }],
        ],
        [
          'data elements with the same aggregations in different order',
          ['BCD03', 'BCD04'],
          [{ value: 3 }, { value: 4 }],
        ],
        [
          'data elements with same and different aggregations',
          ['BCD02', 'BCD03', 'BCD04'],
          [{ value: 2 }, { value: 3 }, { value: 4 }],
        ],
      ];

      it.each(testData)('%s', (_, dataElementCodes, expected) => {
        const aggregationsByCode = Object.fromEntries(
          dataElementCodes.map(code => [
            code,
            AGGREGATION_RESPONSE_CONFIG[code].expectedAggregations,
          ]),
        );
        return expect(fetchAnalytics(aggregator, aggregationsByCode, {})).resolves.toStrictEqual(
          expected,
        );
      });
    });
  });
});
