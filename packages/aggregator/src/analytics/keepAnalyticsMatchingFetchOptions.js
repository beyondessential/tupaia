/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { comparePeriods, dateStringToPeriod } from '@tupaia/utils';

export const keepAnalyticsMatchingFetchOptions = (analytics, fetchOptions) => {
  const { startDate, endDate } = fetchOptions;
  const startPeriod = dateStringToPeriod(startDate);
  const endPeriod = dateStringToPeriod(endDate);

  return analytics.filter(
    ({ period }) =>
      comparePeriods(period, startPeriod) >= 0 && comparePeriods(period, endPeriod) <= 0,
  );
};
