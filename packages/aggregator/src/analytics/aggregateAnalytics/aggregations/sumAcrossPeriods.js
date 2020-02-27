/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Add the analytics together across the periods listed in the analytic response, and return an array
 * with just one analytic per data element/organisation unit pair
 *
 * @param {Array} analytics
 * @param {Array}
 */
export const sumAcrossPeriods = analytics => {
  const summedAnalytics = [];
  analytics.forEach(responseElement => {
    const indexOfEquivalentResponseElement = summedAnalytics.findIndex(
      otherResponseElement =>
        responseElement.dataElement === otherResponseElement.dataElement &&
        responseElement.organisationUnit === otherResponseElement.organisationUnit,
    );
    // If there are no matching response elements already being returned, add it
    if (indexOfEquivalentResponseElement < 0) {
      summedAnalytics.push(responseElement);
    } else {
      summedAnalytics[indexOfEquivalentResponseElement].value += responseElement.value;
    }
  });
  return summedAnalytics;
};
