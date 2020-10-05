/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { isDimension } from '../dimensions';

describe('dimensions', () => {
  describe('isDimension()', () => {
    it('should return true for valid DHIS2 dimensions', () => {
      expect(isDimension('dx')).to.be.true;
      expect(isDimension('ou')).to.be.true;
      expect(isDimension('pe')).to.be.true;
    });

    it('should return false for invalid DHIS2 dimensions', () => {
      expect(isDimension('random')).to.be.false;
      expect(isDimension('OU')).to.be.false;
    });
  });
});
