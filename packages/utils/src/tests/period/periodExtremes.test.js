/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { getMostAncientPeriod, getMostRecentPeriod } from '../../period/periodExtremes';

context('periodExtremes', () => {
  describe('getMostRecentPeriod()', () => {
    it('should return null for empty input', () => {
      expect(getMostRecentPeriod()).to.equal(null);
    });

    it('should return null if there are no valid periods in the input', () => {
      expect(getMostRecentPeriod(['NOT_A_PERIOD', 'NOT_ONE_EITHER'])).to.equal(null);
    });

    it('should return the most recent valid period', () => {
      expect(getMostRecentPeriod(['NOT_A_PERIOD', '2020W2', 'NOT_ONE_EITHER'])).to.equal('2020W2');
    });

    it('should return the most recent period with different period types', () => {
      expect(getMostRecentPeriod(['2020', '2020W2', '20200102'])).to.equal('2020');
    });

    it('should return the least coarse recent period with different period types', () => {
      expect(getMostRecentPeriod(['2020', '2020W1', '20200101'])).to.equal('20200101');
    });
  });
  describe('getMostAncientPeriod()', () => {
    it('should return null for empty input', () => {
      expect(getMostAncientPeriod()).to.equal(null);
    });

    it('should return null if there are no valid periods in the input', () => {
      expect(getMostAncientPeriod(['NOT_A_PERIOD', 'NOT_ONE_EITHER'])).to.equal(null);
    });

    it('should return the most ancient valid period', () => {
      expect(getMostAncientPeriod(['NOT_A_PERIOD', '2020W2', 'NOT_ONE_EITHER'])).to.equal('2020W2');
    });

    it('should return the most recent ancient with different period types', () => {
      expect(getMostAncientPeriod(['2020', '2020W2', '20200102'])).to.equal('2020W2');
    });

    it('should return the least coarse recent ancient with different period types', () => {
      expect(getMostAncientPeriod(['2020', '2019W1', '20200101'])).to.equal('20200101');
    });
  });
});
