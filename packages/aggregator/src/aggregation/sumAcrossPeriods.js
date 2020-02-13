/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

// Add the results together across the periods listed in the analytic response, and return an array
// with just one result per data element/organisation unit pair
export const sumAcrossPeriods = results => {
  const summedResults = [];
  results.forEach(responseElement => {
    const indexOfEquivalentResponseElement = summedResults.findIndex(
      otherResponseElement =>
        responseElement.dataElement === otherResponseElement.dataElement &&
        responseElement.organisationUnit === otherResponseElement.organisationUnit,
    );
    // If there are no matching response elements already being returned, add it
    if (indexOfEquivalentResponseElement < 0) {
      summedResults.push(responseElement);
    } else {
      summedResults[indexOfEquivalentResponseElement].value += responseElement.value;
    }
  });
  return summedResults;
};
