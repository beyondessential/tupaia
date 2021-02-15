/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { comparePeriods, dateStringToPeriod } from '@tupaia/utils';

export const keepAnalyticsMatchingFetchOptions = (analytics, fetchOptions) => {
  const { startDate, endDate } = fetchOptions;
  // TODO this check can possibly be removed after
  // https://github.com/beyondessential/tupaia-backlog/issues/2150 is implemented, if we ensure that
  // `startDate` and `endDate` always exist in client requests
  if (!startDate || !endDate) {
    return analytics;
  }

  const startPeriod = dateStringToPeriod(startDate);
  const endPeriod = dateStringToPeriod(endDate);

  return analytics.filter(
    ({ period }) =>
      comparePeriods(period, startPeriod) >= 0 && comparePeriods(period, endPeriod) <= 0,
  );
};
