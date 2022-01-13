/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Groups { dataElement: value } pairs per organisationUnit/period combination
 */
export const analyticsToAnalyticClusters = analytics => {
  const clusterMap = {};
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

export const arrayToAnalytics = arrayAnalytics =>
  arrayAnalytics.map(([dataElement, organisationUnit, period, value]) => ({
    dataElement,
    organisationUnit,
    period,
    value,
  }));
