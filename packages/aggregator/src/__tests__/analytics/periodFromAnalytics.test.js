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
    expect(periodFromAnalytics([], fetchOptions)).toStrictEqual(expected);
  });

  it('should find the earliest period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions)).toHaveProperty(
      'earliestAvailable',
      '20200101',
    );
  });

  it('should find the latest period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions)).toHaveProperty(
      'latestAvailable',
      '20200106',
    );
  });

  it('should return the requested period', () => {
    expect(periodFromAnalytics(analytics, fetchOptions)).toHaveProperty(
      'requested',
      fetchOptions.period,
    );
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
    expect(periodFromAnalytics(yearAnalytics, fetchOptions)).toStrictEqual(expected);
  });

  it('should prefer the correct period types amongst analytics', () => {
    const mixedAnalytics = [
      { period: '20100405', value: 1 },
      { period: '201005', value: 2 },
      { period: '2010', value: 4 },
      { period: '20100505', value: 3 },
    ];
    const expected = {
      earliestAvailable: '2010',
      latestAvailable: '2010',
      requested: fetchOptions.period,
    };

    expect(periodFromAnalytics(mixedAnalytics, fetchOptions)).toStrictEqual(expected);
  });

  it('should prefer the correct period types amongst analytics across years', () => {
    const mixedAnalytics = [
      { period: '20100405', value: 1 },
      { period: '201005', value: 2 },
      { period: '2010', value: 4 },
      { period: '20110101', value: 4 },
      { period: '2010', value: 4 },
      { period: '200706', value: 4 },
      { period: '20100505', value: 3 },
    ];
    const expected = {
      earliestAvailable: '200706',
      latestAvailable: '20110101',
      requested: fetchOptions.period,
    };

    expect(periodFromAnalytics(mixedAnalytics, fetchOptions)).toStrictEqual(expected);
  });
});
