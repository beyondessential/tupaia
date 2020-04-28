import { getPreferredPeriod } from './aggregateAnalytics/aggregations/utils';

const MAX_LATEST_DATE = '9999';

export const periodFromAnalytics = (analytics, { period: requestedPeriod }) => {
  const returnPeriod = analytics.reduce(
    (currentDateRange, dataPoint) => {
      const { latestAvailable } = currentDateRange;
      const earliestAvailable = currentDateRange.earliestAvailable || MAX_LATEST_DATE;
      const { period } = dataPoint;
      return {
        earliestAvailable:
          period && period === getPreferredPeriod(period, earliestAvailable)
            ? earliestAvailable
            : period,
        latestAvailable:
          period === getPreferredPeriod(period, latestAvailable) ? period : latestAvailable,
      };
    },
    { earliestAvailable: null, latestAvailable: null },
  );

  return { requested: requestedPeriod, ...returnPeriod };
};
