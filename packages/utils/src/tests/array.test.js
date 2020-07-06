/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { min, max } from '../array';

describe('array', () => {
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
