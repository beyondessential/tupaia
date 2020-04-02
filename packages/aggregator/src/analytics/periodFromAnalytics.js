import { getPreferredPeriod } from './aggregateAnalytics/aggregations/utils';

export const periodFromAnalytics = analytics => {
  return analytics.reduce(
    (currentDateRange, dataPoint) => {
      const { latestPeriod } = currentDateRange;
      const earliestPeriod = currentDateRange.earliestPeriod || '99991230';
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
