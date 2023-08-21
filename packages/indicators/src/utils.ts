/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Analytic, AnalyticCluster } from './types';

export type ArrayAnalytic = [string, string, string, string | number];

/**
 * Groups { dataElement: value } pairs per organisationUnit/period combination
 */
export const analyticsToAnalyticClusters = (analytics: Analytic[]): AnalyticCluster[] => {
  const clusterMap: Record<string, AnalyticCluster> = {};
  analytics.forEach(analytic => {
    const { dataElement, organisationUnit, period, value } = analytic;
    const key = `${organisationUnit}__${period}`;
    if (!clusterMap[key]) {
      clusterMap[key] = { organisationUnit, period, dataValues: {} };
    }
    clusterMap[key].dataValues[dataElement] = value;
  });

  return Object.values(clusterMap);
};

export const arrayToAnalytics = (arrayAnalytics: ArrayAnalytic[]): Analytic[] =>
  arrayAnalytics.map(([dataElement, organisationUnit, period, value]) => ({
    dataElement,
    organisationUnit,
    period,
    value,
  }));
