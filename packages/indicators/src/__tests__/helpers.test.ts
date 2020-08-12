/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expandAggregation, extractDataElementCodesFromFormula } from '../helpers';

describe('helpers', () => {
  describe('extractDataElementCodesFromFormula()', () => {
    it('single letter codes', () => {
      expect(extractDataElementCodesFromFormula('A + B')).toEqual(new Set(['A', 'B']));
    });

    it('multi letter codes', () => {
      expect(extractDataElementCodesFromFormula('BCD01 + BCD02')).toEqual(
        new Set(['BCD01', 'BCD02']),
      );
    });

    it('continuous whitespace', () => {
      expect(extractDataElementCodesFromFormula(' BCD01  +  BCD02 ')).toEqual(
        new Set(['BCD01', 'BCD02']),
      );
    });

    it('same code multiple times', () => {
      expect(extractDataElementCodesFromFormula('BCD01 * BCD02 + BCD01')).toEqual(
        new Set(['BCD01', 'BCD02']),
      );
    });

    it('multiple symbols', () => {
      expect(
        extractDataElementCodesFromFormula('(BCD01 + BCD02) / ((BCD03 * BCD04) - BCD05)'),
      ).toEqual(new Set(['BCD01', 'BCD02', 'BCD03', 'BCD04', 'BCD05']));
    });
  });

  describe('expandAggregation', () => {
    it('string aggregation', () => {
      expect(expandAggregation('BCD01 + BCD02', 'MOST_RECENT')).toStrictEqual({
        BCD01: 'MOST_RECENT',
        BCD02: 'MOST_RECENT',
      });
    });

    it('object aggregation', () => {
      expect(
        expandAggregation('BCD01 + BCD02', { BCD01: 'MOST_RECENT', BCD02: 'MOST_RECENT' }),
      ).toStrictEqual({
        BCD01: 'MOST_RECENT',
        BCD02: 'MOST_RECENT',
      });
    });
  });
});
