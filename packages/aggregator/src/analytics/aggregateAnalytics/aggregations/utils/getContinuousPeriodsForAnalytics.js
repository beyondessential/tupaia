/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertToPeriod, getCurrentPeriod, getPeriodsInRange } from '@tupaia/utils';

/**
 * Calculates an array of continuous period strings from the first period in the analytics until the last
 * Periods are broken down by aggregationPeriod granularity.
 * If continueTilCurrentPeriod is true, the end period will be the current period.
 * @param {} analytics
 * @param {*} aggregationPeriod
 * @param {*} continueTilCurrentPeriod
 */
export const getContinuousPeriodsForAnalytics = (
  analytics,
  aggregationPeriod,
  continueTilCurrentPeriod,
) => {
  const periodsInAnalytics = analytics.map(analytic =>
    convertToPeriod(analytic.period, aggregationPeriod),
  );
  const endPeriod =
    !continueTilCurrentPeriod && periodsInAnalytics.length
      ? Math.max(...periodsInAnalytics).toString()
      : getCurrentPeriod(aggregationPeriod);

  const startPeriod = periodsInAnalytics.length
    ? Math.min(...periodsInAnalytics).toString()
    : endPeriod;

  return getPeriodsInRange(startPeriod, endPeriod);
};
