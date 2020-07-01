/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * Combines analytics together across org units
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 * @param {Function} baseValueMapper
 * @param {Function} keyMapper
 */
const valuePerOrgGroup = (analytics, aggregationConfig, baseValueMapper, keyMapper) => {
  const { orgUnitMap = {}, valueToMatch } = aggregationConfig;
  const valueMapper = valueToMatch ? createConfiguredValueMapper(valueToMatch) : baseValueMapper;

  const analyticsByKey = {};
  analytics.forEach(analytic => {
    const organisationUnit =
      (orgUnitMap[analytic.organisationUnit] && orgUnitMap[analytic.organisationUnit].code) ||
      analytic.organisationUnit;
    const key = keyMapper(analytic, organisationUnit);
    const value = valueMapper(analytic.value);

    // If there are no matching response elements already being returned, add it
    if (!analyticsByKey[key]) {
      analyticsByKey[key] = { ...analytic, value, organisationUnit };
    } else {
      analyticsByKey[key].value += value;
    }
  });

  return Object.values(analyticsByKey);
};

/**
 * Sums values across org units AND periods to return a single value per aggregation org unit
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const sumPerOrgGroup = (analytics, aggregationConfig) =>
  valuePerOrgGroup(analytics, aggregationConfig, sumValueMapper, perOrgGroupKey);

/**
 * Sums values across org units to return a value per period per aggregation org unit (if one exists for that period)
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const sumPerPeriodPerOrgGroup = (analytics, aggregationConfig) =>
  valuePerOrgGroup(analytics, aggregationConfig, sumValueMapper, perPeriodPerOrgGroupKey);

/**
 * Counts analytics across org units AND periods to return a single value per aggregation org unit
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const countPerOrgGroup = (analytics, aggregationConfig) =>
  valuePerOrgGroup(analytics, aggregationConfig, countValueMapper, perOrgGroupKey);

/**
 * Counts analytics across org units to return a value per period per aggregation org unit (if one exists for that period)
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const countPerPeriodPerOrgGroup = (analytics, aggregationConfig) =>
  valuePerOrgGroup(analytics, aggregationConfig, countValueMapper, perPeriodPerOrgGroupKey);

const createConfiguredValueMapper = valueToMatch =>
  valueToMatch === '*' ? () => 1 : value => (value === valueToMatch ? 1 : 0);

const sumValueMapper = value => value;

const countValueMapper = () => 1;

const perOrgGroupKey = (analytic, organisationUnit) =>
  `${analytic.dataElement}__${organisationUnit}`;

const perPeriodPerOrgGroupKey = (analytic, organisationUnit) =>
  `${analytic.period}__${analytic.dataElement}__${organisationUnit}`;
