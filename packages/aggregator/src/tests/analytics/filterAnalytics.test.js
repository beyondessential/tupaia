/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { filterAnalytics } from '../../analytics/filterAnalytics';

const analytics = [{ value: 1 }, { value: 2 }, { value: 3 }];

describe('filterAnalytics()', () => {
  it('empty filter', () => {
    expect(() => filterAnalytics(analytics)).to.not.throw();
    expect(() => filterAnalytics(analytics, undefined)).to.not.throw();
    expect(() => filterAnalytics(analytics, {})).to.not.throw();
  });

  describe('filter type', () => {
    it('EQ', () => {
      expect(filterAnalytics(analytics, { EQ: 2 })).to.deep.equal([{ value: 2 }]);
      expect(filterAnalytics(analytics, { EQ: 4 })).to.deep.equal([]);
    });

    it('GT', () => {
      expect(filterAnalytics(analytics, { GT: 2 })).to.deep.equal([{ value: 3 }]);
      expect(filterAnalytics(analytics, { EQ: 4 })).to.deep.equal([]);
    });

    it('GE', () => {
      expect(filterAnalytics(analytics, { GE: 2 })).to.deep.equal([{ value: 2 }, { value: 3 }]);
      expect(filterAnalytics(analytics, { GE: 4 })).to.deep.equal([]);
    });

    it('LT', () => {
      expect(filterAnalytics(analytics, { LT: 2 })).to.deep.equal([{ value: 1 }]);
      expect(filterAnalytics(analytics, { LT: 0 })).to.deep.equal([]);
    });

    it('LE', () => {
      expect(filterAnalytics(analytics, { LE: 2 })).to.deep.equal([{ value: 1 }, { value: 2 }]);
      expect(filterAnalytics(analytics, { LE: 0 })).to.deep.equal([]);
    });

    describe('combines multiple types using AND logic', () => {
      it('one type superset of the other', () => {
        expect(filterAnalytics(analytics, { LE: 2, EQ: 2 })).to.deep.equal([{ value: 2 }]);
        expect(filterAnalytics(analytics, { EQ: 2, LE: 2 })).to.deep.equal([{ value: 2 }]);
      });

      it('mutually exclusive types', () => {
        expect(filterAnalytics(analytics, { EQ: 2, LT: 2 })).to.deep.equal([]);
        expect(filterAnalytics(analytics, { LT: 2, EQ: 2 })).to.deep.equal([]);
      });

      it('known and unknown types', () => {
        expect(filterAnalytics(analytics, { EQ: 2, unknownFilter: 3 })).to.deep.equal([
          { value: 2 },
        ]);
        expect(filterAnalytics(analytics, { EQ: 2, unknownFilter: 3 })).to.deep.equal([
          { value: 2 },
        ]);
      });
    });

    it('unknown type', () => {
      expect(filterAnalytics(analytics, { unknownFilter: 2 })).to.deep.equal([
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ]);
    });
  });
});
