import { PERIOD_TYPES } from '@tupaia/tsutils';
import { convertToPeriod, isFuturePeriod, getCurrentPeriod } from '@tupaia/utils';

/**
 * Add the analytics together across the periods listed in the analytic response, and return an array
 * with just one analytic per data element/organisation unit pair
 */
export const sumAcrossPeriods = (analytics, { periodOptions } = {}) => {
  const filteredAnalytics = filterAnalytics(analytics, periodOptions);

  const summedAnalytics = [];
  filteredAnalytics.forEach(analytic => {
    const i = summedAnalytics.findIndex(
      otherAnalytic =>
        analytic.dataElement === otherAnalytic.dataElement &&
        analytic.organisationUnit === otherAnalytic.organisationUnit,
    );
    // If there are no matching response elements already being returned, add it
    if (i < 0) {
      summedAnalytics.push({ ...analytic });
    } else {
      summedAnalytics[i].value += analytic.value;
    }
  });

  if (periodOptions) {
    const transformPeriod = getPeriodTransformer(periodOptions);
    return summedAnalytics.map(analytic => ({
      ...analytic,
      period: transformPeriod(analytic.period),
    }));
  }
  return summedAnalytics;
};

const filterAnalytics = (analytics, periodOptions = {}) =>
  periodOptions.excludeFuture
    ? analytics.filter(({ period }) => !isFuturePeriod(period))
    : analytics;

const getPeriodTransformer = ({ periodType, useCurrent }) => {
  if (useCurrent) {
    const currentPeriod = getCurrentPeriod(periodType || PERIOD_TYPES.DAY);
    return () => currentPeriod;
  }
  if (periodType) {
    return period => convertToPeriod(period, periodType);
  }
  return period => period;
};
