/**
 * Modify the analytic periods to use the same, latest year in order to layer the data within a dashboard.
 *
 *
 * @param {Array} analytics
 * @returns {Array}
 */

import { periodToMoment, periodToType } from '@tupaia/tsutils';
import { momentToPeriod } from '@tupaia/utils';

export const layerYearOnYear = analytics => {
  const latestYear = Math.max(...analytics.map(analytic => periodToMoment(analytic.period).year()));

  const layeredAnalytics = analytics.map(analytic => {
    const modifiedAnalytic = { ...analytic };
    const analyticMoment = periodToMoment(analytic.period);
    const yearsAgo = latestYear - analyticMoment.year();

    if (yearsAgo > 0) {
      // 2. Modify name of data elements yr_ago
      modifiedAnalytic.dataElement = formatLayeredDataElementCode(
        modifiedAnalytic.dataElement,
        yearsAgo,
      );

      // 3. Make all periods return the latest year
      const newAnalyticMoment = analyticMoment.clone();
      newAnalyticMoment.year(latestYear);
      const periodType = periodToType(analytic.period);
      modifiedAnalytic.period = momentToPeriod(newAnalyticMoment, periodType);
    }
    return modifiedAnalytic;
  });

  return layeredAnalytics;
};

export const formatLayeredDataElementCode = (dataElementCode, yearsAgo) => {
  return yearsAgo > 0 ? `${dataElementCode}_${yearsAgo}_yr_ago` : dataElementCode;
};
