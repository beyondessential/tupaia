/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { countDistinct, min, max } from '../array';

describe('array', () => {
  describe('countDistinct', () => {
    it('empty array ', () => {
      expect(countDistinct([])).to.equal(0);
    });

    it('single item ', () => {
      expect(countDistinct([0])).to.equal(1);
    });

    it('multiple items, same value', () => {
      expect(countDistinct([0, 0])).to.equal(1);
    });

    it('multiple items, different values', () => {
      expect(countDistinct([0, 1])).to.equal(2);
    });

    it('multiple items, mixed same & different values', () => {
      expect(countDistinct([0, 1, 0, 1, 1, 2])).to.equal(3);
    });

    describe('different mapper types', () => {
      it('function', () => {
        expect(countDistinct([1.1, 2, 1.3], Math.floor)).to.equal(2);
      });

      it('string', () => {
        expect(
          countDistinct(
            [
              { age: 18, postcode: '3121', gender: 'female' },
              { age: 18, postcode: '3122', gender: 'male' },
              { age: 18, postcode: '3123', gender: 'female' },
              { age: 18, postcode: '3123', gender: 'female' },
            ],
            'gender',
          ),
        ).to.equal(2);
      });

      it('undefined', () => {
        expect(countDistinct([1, 2, 3, 2, 2, 1, 4])).to.equal(4);
      });
    });
  });

  describe('min', () => {
    it('should return the minimum against the provided values', () => {
      expect(min([2, 3, 10])).to.equal(2);
      expect(min([-2, 1, 3, 10])).to.equal(-2);
    });

    it('should return `undefined` for a non compatible input', () => {
      [undefined, null, []].forEach(input => expect(min(input)).to.equal(undefined));
    });
  });

  describe('max', () => {
    it('should return the maximum against the provided values', () => {
      expect(max([2, 3, 10])).to.equal(10);
      expect(max([-20, 1, 3, 10])).to.equal(10);
    });

    it('should return `undefined` for a non compatible input', () => {
      [undefined, null, []].forEach(input => expect(max(input)).to.equal(undefined));
    });
  });
});
