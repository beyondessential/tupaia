/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * Add the analytics together across org units AND periods
 * with just one analytic per data element/ancestor pair
 *
 * @param {Array} analytics
 * @param {Array}
 */
export const sumPerOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap = {}, valueToMatch } = aggregationConfig;
  // TODO: I would like to use checkValueSatisfiesCondition from web-config-server, but maybe
  // it should be moved to utils?
  const valueMapper = valueToMatch ? createValueMapper(valueToMatch) : value => value;
  const summedAnalytics = [];
  analytics.forEach(responseElement => {
    const organisationUnit =
      orgUnitMap[responseElement.organisationUnit] || responseElement.organisationUnit;
    const indexOfEquivalentResponseElement = summedAnalytics.findIndex(
      otherResponseElement =>
        responseElement.dataElement === otherResponseElement.dataElement &&
        organisationUnit === otherResponseElement.organisationUnit,
    );
    // If there are no matching response elements already being returned, add it
    const value = valueMapper(responseElement.value);
    if (indexOfEquivalentResponseElement < 0) {
      summedAnalytics.push({ ...responseElement, value, organisationUnit });
    } else {
      summedAnalytics[indexOfEquivalentResponseElement].value += value;
    }
  });
  return summedAnalytics;
};

const createValueMapper = valueToMatch =>
  valueToMatch === '*' ? () => 1 : value => (value === valueToMatch ? 1 : 0);

export const replaceOrgUnitWithOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap } = aggregationConfig;
  return analytics.map(responseElement => {
    const organisationUnit = orgUnitMap[responseElement.organisationUnit];
    return { ...responseElement, organisationUnit };
  });
};
