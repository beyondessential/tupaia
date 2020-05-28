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
export const sumPerOrgGroup = (analytics, aggregationConfig, valueMapper = value => value) => {
  const { orgUnitMap = {} } = aggregationConfig;
  console.log('Aggregating:');
  console.log(Object.entries(orgUnitMap) && Object.entries(orgUnitMap)[0]);
  console.log(analytics && analytics[0]);
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
      console.log('added', value);
      summedAnalytics.push({ ...responseElement, value, organisationUnit });
    } else {
      console.log('it is working', value);
      summedAnalytics[indexOfEquivalentResponseElement].value += value;
    }
  });
  return summedAnalytics;
};

export const replaceChildrenPerOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap } = aggregationConfig;
  return analytics.map(responseElement => {
    const organisationUnit = orgUnitMap[responseElement.organisationUnit];
    return { ...responseElement, organisationUnit };
  });
};
