/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { keepAnalyticsMatchingFetchOptions } from '../../analytics/keepAnalyticsMatchingFetchOptions';

describe('keepAnalyticsMatchingFetchOptions()', () => {
  describe('keeps analytics with periods inside the specified dateRange', () => {
    const periodsToAnalytics = periods =>
      periods.map(period => ({ dataElement: 'BCD01', organisationUnit: 'TO', value: 1, period }));

    const fetchOptions = { startDate: '2020-01-01', endDate: '2020-12-31' };
    const testData = [
      ['empty analytics', [], []],
      ['all periods in dateRange', ['202010101', '20201231'], ['202010101', '20201231']],
      ['some periods in dateRange', ['20191231', '20200101', '20201231'], ['20200101', '20201231']],
      ['no periods in dateRange', ['20191231', '20210101'], []],
    ];

    it.each(testData)('%s', (_, inputPeriods, expectedPeriods) => {
      const inputAnalytics = periodsToAnalytics(inputPeriods);
      const expectedAnalytics = periodsToAnalytics(expectedPeriods);

      expect(keepAnalyticsMatchingFetchOptions(inputAnalytics, fetchOptions)).toStrictEqual(
        expectedAnalytics,
      );
    });
  });
});
