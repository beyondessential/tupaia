/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { filterAnalytics } from '../../analytics/filterAnalytics';

const analytics = [{ value: 1 }, { value: 2 }, { value: 3 }];

describe('filterAnalytics()', () => {
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

  it('unknown filter type', () => {
    expect(filterAnalytics(analytics, { unknownFilter: 2 })).to.deep.equal([
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]);
  });
});
