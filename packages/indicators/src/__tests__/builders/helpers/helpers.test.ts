/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  extractDataElementCodesFromFormula,
  fetchAnalytics,
  getAggregationsByCode,
  groupKeysByValueJson,
} from '../../../builders/helpers';
import { Aggregation } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_CONFIG } from './helpers.fixtures';

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

  describe('groupKeysByValueJson()', () => {
    it('single key', () => {
      const value = [{ alpha: 1, beta: 2 }, 3, true];
      const valueJson = JSON.stringify(value);
      expect(groupKeysByValueJson({ key: value })).toStrictEqual({ [valueJson]: ['key'] });
    });

    describe('object values', () => {
      // Use getters instead of raw values to make sure that functionality
      // does not depend on strict object equality ('===')
      const getAlpha = () => ({ initial: 'A', order: 1 });
      const getReverseAlpha = () => ({ order: 1, initial: 'A' });
      const getBeta = () => ({ initial: 'B', order: 2 });

      const alphaJson = JSON.stringify(getAlpha());
      const reverseAlphaJson = JSON.stringify(getReverseAlpha());
      const betaJson = JSON.stringify(getBeta());

      const testData: [string, Record<string, {}>, Record<string, string[]>][] = [
        [
          'different entries',
          { alpha: getAlpha(), beta: getBeta() },
          { [alphaJson]: ['alpha'], [betaJson]: ['beta'] },
        ],
        [
          'same entries, same order',
          { alpha1: getAlpha(), alpha2: getAlpha() },
          { [alphaJson]: ['alpha1', 'alpha2'] },
        ],
        [
          'same entries, different order',
          { alpha: getAlpha(), reverseAlpha: getReverseAlpha() },
          { [alphaJson]: ['alpha'], [reverseAlphaJson]: ['reverseAlpha'] },
        ],
        [
          'same and different entries',
          { alpha1: getAlpha(), beta: getBeta(), alpha2: getAlpha() },
          { [alphaJson]: ['alpha1', 'alpha2'], [betaJson]: ['beta'] },
        ],
      ];

      it.each(testData)('%s', (_, object, expected) => {
        expect(groupKeysByValueJson(object)).toStrictEqual(expected);
      });
    });

    describe('array values', () => {
      // Use getters instead of raw values to make sure that functionality
      // does not depend on strict array equality ('===')
      const getUpper = () => ['A', 'B'];
      const getReverseUpper = () => ['B', 'A'];
      const getLower = () => ['a', 'b'];

      const upperJson = JSON.stringify(getUpper());
      const reverseUpperJson = JSON.stringify(getReverseUpper());
      const lowerJson = JSON.stringify(getLower());

      const testData: [string, Record<string, unknown[]>, Record<string, string[]>][] = [
        [
          'different items',
          { upper: getUpper(), lower: getLower() },
          { [upperJson]: ['upper'], [lowerJson]: ['lower'] },
        ],
        [
          'same items, same order',
          { upper1: getUpper(), upper2: getUpper() },
          { [upperJson]: ['upper1', 'upper2'] },
        ],
        [
          'same items, different order',
          { upper: getUpper(), reverseUpper: getReverseUpper() },
          { [upperJson]: ['upper'], [reverseUpperJson]: ['reverseUpper'] },
        ],
        [
          'same and different items',
          { upper1: getUpper(), lower: getLower(), upper2: getUpper() },
          { [upperJson]: ['upper1', 'upper2'], [lowerJson]: ['lower'] },
        ],
      ];

      it.each(testData)('%s', (_, object, expected) => {
        expect(groupKeysByValueJson(object)).toStrictEqual(expected);
      });
    });
  });

  describe('fetchAnalytics()', () => {
    const aggregator = createAggregator(Object.values(ANALYTIC_RESPONSE_CONFIG));

    it('uses the provided fetchOptions', async () => {
      const fetchOptions = { organisationUnitCodes: ['TO'] };
      await fetchAnalytics(
        aggregator,
        { BCD01: ANALYTIC_RESPONSE_CONFIG.BCD01.aggregations },
        fetchOptions,
      );

      expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
        expect.anything(),
        fetchOptions,
        expect.anything(),
      );
    });

    it('fetches the expected analytics for a variety of same/different aggregations per data element', async () => {
      const aggregationsByCode = {
        BCD01: ANALYTIC_RESPONSE_CONFIG.BCD01.aggregations,
        BCD02: ANALYTIC_RESPONSE_CONFIG.BCD02.aggregations,
        BCD03: ANALYTIC_RESPONSE_CONFIG.BCD03.aggregations,
        BCD04: ANALYTIC_RESPONSE_CONFIG.BCD04.aggregations,
      };

      return expect(
        fetchAnalytics(aggregator, aggregationsByCode, {}),
      ).resolves.toIncludeSameMembers([
        ANALYTIC_RESPONSE_CONFIG.BCD01.analytic,
        ANALYTIC_RESPONSE_CONFIG.BCD02.analytic,
        ANALYTIC_RESPONSE_CONFIG.BCD03.analytic,
        ANALYTIC_RESPONSE_CONFIG.BCD04.analytic,
      ]);
    });
  });
});
