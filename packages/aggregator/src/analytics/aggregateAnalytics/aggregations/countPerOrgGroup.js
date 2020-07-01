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
export const countPerOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap = {}, valueToMatch } = aggregationConfig;
  const valueMapper = valueToMatch ? createValueMapper(valueToMatch) : () => 1;

  const countAnalyticsByKey = {};
  analytics.forEach(analytic => {
    const organisationUnit =
      (orgUnitMap[analytic.organisationUnit] && orgUnitMap[analytic.organisationUnit].code) ||
      analytic.organisationUnit;
    const key = `${analytic.period}__${analytic.dataElement}__${organisationUnit}`;

    const value = valueMapper(analytic.value);

    // If there are no matching response elements already being returned, add it
    if (!countAnalyticsByKey[key]) {
      countAnalyticsByKey[key] = { ...analytic, value, organisationUnit };
    } else {
      countAnalyticsByKey[key].value += value;
    }
  });

  return Object.values(countAnalyticsByKey);
};

const createValueMapper = valueToMatch =>
  valueToMatch === '*' ? () => 1 : value => (value === valueToMatch ? 1 : 0);
