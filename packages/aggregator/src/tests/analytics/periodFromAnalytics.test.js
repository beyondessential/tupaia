/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { periodFromAnalytics } from '../../analytics/periodFromAnalytics';

const analytics = [
  { period: '20200103', value: 1 },
  { period: '20200104', value: 2 },
  { period: '20200101', value: 3 },
  { period: '20200106', value: 4 },
  { period: '20200105', value: 5 },
];
const fetchOptions = { period: '20200104;20200105;20200106;20200107' };

describe('periodFromAnalytics()', () => {
  it('should handle empty analytics', () => {
    const expected = {
      earliestAvailable: null,
      latestAvailable: null,
      requested: fetchOptions.period,
    };
    expect(periodFromAnalytics([], fetchOptions)).to.deep.equal(expected);
  });
  it('should find the earliest period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions).earliestAvailable).to.equal('20200101');
  });
  it('should find the latest period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions).latestAvailable).to.equal('20200106');
  });
  it('should return the requested period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions).requested).to.equal(fetchOptions.period);
  });
  // Doesn't work with week (yet)
  it('should work with year periodType', () => {
    const yearAnalytics = [
      { period: '2010', value: 5 },
      { period: '2020', value: 1 },
      { period: '2020', value: 2 },
      { period: '2020', value: 3 },
      { period: '2001', value: 4 },
      { period: '2010', value: 5 },
    ];
    const expected = {
      earliestAvailable: '2001',
      latestAvailable: '2020',
      requested: fetchOptions.period,
    };
    expect(periodFromAnalytics(yearAnalytics, fetchOptions)).to.deep.equal(expected);
  });
});
