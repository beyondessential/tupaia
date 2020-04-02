import { getPreferredPeriod } from './aggregateAnalytics/aggregations/utils';

export const periodFromAnalytics = analytics => {
  console.log('ANALYTICS: ', analytics);
  return analytics.reduce(
    (element, { earliestPeriod, latestPeriod }) => {
      const { period } = element;
      console.log(element);
      return {
        earliestPeriod:
          period === getPreferredPeriod(period, earliestPeriod) ? earliestPeriod : period,
        latestPeriod: period === getPreferredPeriod(period, latestPeriod) ? period : latestPeriod,
      };
    },
    { earliestPeriod: null, latestPeriod: null },
  );
};
