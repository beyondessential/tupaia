/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Modify the analytic periods to use the same, latest year in order to layer the data within a dashboard.
 *
 *
 * @param {Array} analytics
 * @returns {Array}
 */

import { momentToPeriod, periodToMoment, periodToType } from '@tupaia/utils/dist/period/period';

export const layerYearOnYear = analytics => {
  // 1. Find the latest year
  let latestYear = 0;
  for (const analytic of analytics) {
    const analyticYear = periodToMoment(analytic.period).year();
    latestYear = analyticYear > latestYear ? analyticYear : latestYear;
  }

  const layeredAnalytics = analytics.map(analytic => {
    const modifiedAnalytic = { ...analytic };
    let analyticMoment = periodToMoment(analytic.period);
    const yearsAgo = latestYear - analyticMoment.year();

    if (yearsAgo > 0) {
      // 2. Modify name of data elements yr_ago
      modifiedAnalytic.dataElement = `${modifiedAnalytic.dataElement}_${yearsAgo}_yr_ago`;

      // 3. Make all periods return the latest year
      analyticMoment = analyticMoment.year(latestYear);
      const periodType = periodToType(analytic.period);
      modifiedAnalytic.period = momentToPeriod(analyticMoment, periodType);
    }
    return modifiedAnalytic;
  });

  return layeredAnalytics;
};
