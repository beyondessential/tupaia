/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getMostAncientPeriod, getMostRecentPeriod } from '../../period/periodExtremes';

describe('periodExtremes', () => {
  describe('getMostRecentPeriod()', () => {
    it('should return null for empty input', () => {
      expect(getMostRecentPeriod()).toBeNull();
    });

    it('should return null if there are no valid periods in the input', () => {
      expect(getMostRecentPeriod(['NOT_A_PERIOD', 'NOT_ONE_EITHER'])).toBeNull();
    });

    it('should return the most recent valid period', () => {
      expect(getMostRecentPeriod(['NOT_VALID', '2020W12', 'NEITHER_IS_THIS'])).toBe('2020W12');
    });

    it('should return the most recent period', () => {
      expect(getMostRecentPeriod(['20191202', '20200104', '20200201'])).toBe('20200201');
    });

    it('should return the most recent period with different period types', () => {
      expect(getMostRecentPeriod(['2020', '2020W12', '20200102'])).toBe('2020W12');
    });

    it('should return the least coarse recent period with different period types', () => {
      expect(getMostRecentPeriod(['2020', '2020W01', '20200101'])).toBe('20200101');
    });
  });
  describe('getMostAncientPeriod()', () => {
    it('should return null for empty input', () => {
      expect(getMostAncientPeriod()).toBeNull();
    });

    it('should return null if there are no valid periods in the input', () => {
      expect(getMostAncientPeriod(['NOT_A_PERIOD', 'NOT_ONE_EITHER'])).toBeNull();
    });

    it('should return the most ancient valid period', () => {
      expect(getMostAncientPeriod(['NOT_VALID', '2020W12', 'NEITHER_IS_THIS'])).toBe('2020W12');
    });

    it('should return the most ancient period', () => {
      expect(getMostAncientPeriod(['20191202', '20200104', '20200201'])).toBe('20191202');
    });

    it('should return the most recent ancient with different period types', () => {
      expect(getMostAncientPeriod(['2020', '2020W12', '20200102'])).toBe('2020');
    });

    it('should return the most recent ancient with different period types', () => {
      expect(getMostAncientPeriod(['2020', '2020W12', '20200102'])).toBe('2020');
    });

    it('should return the least coarse recent ancient with different period types', () => {
      expect(getMostAncientPeriod(['2020', '2020Q1', '20200101'])).toBe('20200101');
    });
  });
});
