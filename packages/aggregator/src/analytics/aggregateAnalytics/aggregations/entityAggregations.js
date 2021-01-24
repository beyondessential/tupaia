/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { checkValueSatisfiesCondition, convertToPeriod } from '@tupaia/utils';

/**
 * Combines analytics together across org units
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 * @param {Function} baseValueMapper
 * @param {Function} keyMapper
 */
const valuePerOrgGroup = (analytics, aggregationConfig, valueMapper, keyMapper) => {
  const { orgUnitMap = {}, condition, periodType } = aggregationConfig;
  const filterValueMapper = condition ? createFilterValueMapper(condition) : () => true;

  const analyticsByKey = {};
  analytics.forEach(originalAnalytic => {
    const organisationUnit =
      (orgUnitMap[originalAnalytic.organisationUnit] &&
        orgUnitMap[originalAnalytic.organisationUnit].code) ||
      originalAnalytic.organisationUnit;
    const convertedPeriod = periodType
      ? convertToPeriod(originalAnalytic.period, periodType)
      : originalAnalytic.period;
    const analytic = { ...originalAnalytic, organisationUnit, period: convertedPeriod };
    const key = keyMapper(analytic);
    const value = filterValueMapper(analytic.value) ? valueMapper(analytic.value) : 0;

    // If there are no matching response elements already being returned, add it
    if (!analyticsByKey[key]) {
      analyticsByKey[key] = { ...analytic, value };
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

const createFilterValueMapper = condition => val => checkValueSatisfiesCondition(val, condition);

const sumValueMapper = value => value;

const countValueMapper = () => 1;

const perOrgGroupKey = analytic => `${analytic.dataElement}__${analytic.organisationUnit}`;

const perPeriodPerOrgGroupKey = analytic =>
  `${analytic.period}__${analytic.dataElement}__${analytic.organisationUnit}`;
