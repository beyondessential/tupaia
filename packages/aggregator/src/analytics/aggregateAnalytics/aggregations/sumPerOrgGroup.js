/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * Add the analytics together across org units AND periods
 * with just one analytic per data element/ancestor pair
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const sumPerOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap = {}, valueToMatch } = aggregationConfig;
  const valueMapper = valueToMatch ? createValueMapper(valueToMatch) : value => value;

  const summedAnalyticsByKey = {};
  analytics.forEach(analytic => {
    const organisationUnit = orgUnitMap[analytic.organisationUnit] || analytic.organisationUnit;
    const key = `${analytic.dataElement}__${organisationUnit}`;

    const value = valueMapper(analytic.value);

    // If there are no matching response elements already being returned, add it
    if (!summedAnalyticsByKey[key]) {
      summedAnalyticsByKey[key] = { ...analytic, value, organisationUnit };
    } else {
      summedAnalyticsByKey[key].value += value;
    }
  });

  return Object.values(summedAnalyticsByKey);
};

const createValueMapper = valueToMatch =>
  valueToMatch === '*' ? () => 1 : value => (value === valueToMatch ? 1 : 0);
