/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertToPeriod, getCurrentPeriod, getPeriodsInRange, compareAsc } from '@tupaia/utils';

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
  const sortedPeriodsInAnalytics = periodsInAnalytics.sort(compareAsc);
  const endPeriod =
    !continueTilCurrentPeriod && periodsInAnalytics.length
      ? sortedPeriodsInAnalytics[sortedPeriodsInAnalytics.length - 1].toString() // Max
      : getCurrentPeriod(aggregationPeriod);

  const startPeriod = periodsInAnalytics.length
    ? sortedPeriodsInAnalytics[0].toString() // Min
    : endPeriod;

  return getPeriodsInRange(startPeriod, endPeriod);
};
