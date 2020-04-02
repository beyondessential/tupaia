import { getPreferredPeriod } from './aggregateAnalytics/aggregations/utils';

export const periodFromAnalytics = analytics => {
  return analytics.reduce((element, { earliestPeriod, latestPeriod }) => {
    const { period } = element;
    return {
      earliestPeriod:
        period === getPreferredPeriod(period, earliestPeriod) ? earliestPeriod : period,
      latestPeriod: period === getPreferredPeriod(period, latestPeriod) ? period : latestPeriod,
    };
  });
};
