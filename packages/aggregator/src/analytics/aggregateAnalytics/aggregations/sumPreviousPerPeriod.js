import groupBy from 'lodash.groupby';

import { convertToPeriod, EARLIEST_DATA_DATE_STRING, getPeriodsInRange } from '@tupaia/utils';
import { getContinuousPeriodsForAnalytics } from './utils';

/**
 * @returns {Analytic[]}
 */
export const sumPreviousPerPeriod = (analytics, aggregationConfig, aggregationPeriod) => {
  const { requestedPeriod, sumTillLatestData } = aggregationConfig;
  const periods = calculatePeriodsFromAnalytics(
    analytics,
    aggregationPeriod,
    requestedPeriod,
    sumTillLatestData,
  );
  const analyticsByPeriod = groupBy(analytics, analytic =>
    convertToPeriod(analytic.period, aggregationPeriod),
  );

  /** @type {Analytic[][]} */
  const summedAnalyticsInPeriods = periods.reduce((summedAnalytics, period) => {
    const analyticsForPeriod = analyticsByPeriod[period] || [];

    if (summedAnalytics.length === 0) {
      // for the first period, sum all analytics up to it.
      let analyticsForFirstPeriod = analyticsForPeriod;
      Object.entries(analyticsByPeriod).forEach(([analyticPeriod, analytic]) => {
        if (analyticPeriod < period) {
          analyticsForFirstPeriod = sumByAnalytic(analyticsForFirstPeriod, analytic, period);
        }
      });
      summedAnalytics.push(analyticsForFirstPeriod);
      return summedAnalytics;
    }

    const previousPeriodAnalytics = summedAnalytics[summedAnalytics.length - 1];
    summedAnalytics.push(sumByAnalytic(previousPeriodAnalytics, analyticsForPeriod, period));
    return summedAnalytics;
  }, []);

  return summedAnalyticsInPeriods.flat();
};

/**
 * Returns an array of analytics objects with period=period and
 * value=sum of previousAnalytics and currentAnalytics for the given
 * orgUnit/dataElement combo.
 * previousAnalytics and currentAnalytics are interchangeable
 *
 * @param {Analytic[]} previousAnalytics
 * @param {Analytic[]} currentAnalytics
 * @param {string} period
 * @returns {Analytic[]}
 */

const sumByAnalytic = (previousAnalytics, currentAnalytics, period) => {
  const returnAnalytics = currentAnalytics.map(analytic => ({ ...analytic, period }));
  previousAnalytics.forEach(previousAnalytic => {
    const indexOfEquivalentAnalytic = returnAnalytics.findIndex(
      currentAnalytic =>
        previousAnalytic.dataElement === currentAnalytic.dataElement &&
        previousAnalytic.organisationUnit === currentAnalytic.organisationUnit,
    );

    // If there are no matching response elements already being returned, add it
    if (indexOfEquivalentAnalytic < 0) {
      returnAnalytics.push({ ...previousAnalytic, period });
    } else {
      returnAnalytics[indexOfEquivalentAnalytic].value += previousAnalytic.value;
    }
  });
  return returnAnalytics;
};

const calculatePeriodsFromAnalytics = (
  analytics,
  aggregationPeriod,
  requestedPeriod,
  sumTillLatestData = false,
) => {
  const periodsInAnalytics = getContinuousPeriodsForAnalytics(analytics, aggregationPeriod);
  if (!requestedPeriod) {
    return periodsInAnalytics;
  }
  const requestedPeriodArray = requestedPeriod
    .split(';')
    .map(period => convertToPeriod(period, aggregationPeriod));

  const endPeriod = Math.min(
    sumTillLatestData ? Math.max(...periodsInAnalytics) : Infinity,
    Math.max(...requestedPeriodArray),
  ).toString();

  const startPeriod = Math.max(
    Math.min(...periodsInAnalytics, endPeriod),
    Math.min(...requestedPeriodArray),
  ).toString();

  return getPeriodsInRange(startPeriod, endPeriod);
};

export const getDateRangeForSumPreviousPerPeriod = dateRange => ({
  startDate: EARLIEST_DATA_DATE_STRING,
  endDate: dateRange.endDate,
});
