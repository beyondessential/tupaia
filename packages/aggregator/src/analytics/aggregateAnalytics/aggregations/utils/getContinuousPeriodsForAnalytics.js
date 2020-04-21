/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertToPeriod, getCurrentPeriod, getPeriodsInRange } from '@tupaia/dhis-api';

/**
 * Calculates an array of continuous period strings from the first period in the analytics until the last
 * Periods are broken down by aggregationPeriod granularity
 * @param {} analytics
 * @param {*} aggregationPeriod
 */
export const getContinuousPeriodsForAnalytics = (analytics, aggregationPeriod) => {
  const periodsInAnalytics = analytics.map(analytic =>
    convertToPeriod(analytic.period, aggregationPeriod),
  );
  const endPeriod = periodsInAnalytics.length
    ? Math.max(...periodsInAnalytics).toString()
    : getCurrentPeriod(aggregationPeriod);

  const startPeriod = periodsInAnalytics.length
    ? Math.min(...periodsInAnalytics).toString()
    : endPeriod;

  return getPeriodsInRange(startPeriod, endPeriod);
};
