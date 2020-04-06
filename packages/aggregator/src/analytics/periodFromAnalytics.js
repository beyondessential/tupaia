import { getPreferredPeriod } from './aggregateAnalytics/aggregations/utils';

const MAX_LATEST_DATE = '99991230';

export const periodFromAnalytics = analytics => {
  return analytics.reduce(
    (currentDateRange, dataPoint) => {
      const { latestPeriod } = currentDateRange;
      const earliestPeriod = currentDateRange.earliestPeriod || MAX_LATEST_DATE;
      const { period } = dataPoint;
      return {
        earliestPeriod:
          period && period === getPreferredPeriod(period, earliestPeriod) ? earliestPeriod : period,
        latestPeriod: period === getPreferredPeriod(period, latestPeriod) ? period : latestPeriod,
      };
    },
    { earliestPeriod: null, latestPeriod: null },
  );
};
