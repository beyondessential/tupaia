/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { getPreferredPeriod } from './getPreferredPeriod';

// Filter to get latest period results from results
export const filterLatestResults = (results, orgUnitToGroupKeys) => {
  const filteredResults = [];
  // Hold on to a cache of the latest results found for each data element/organisation unit combo
  const latestResultsCache = {};
  results.forEach(responseElement => {
    const { dataElement, organisationUnit, period } = responseElement;
    const organisationUnitCode = orgUnitToGroupKeys
      ? orgUnitToGroupKeys[organisationUnit]
      : organisationUnit;
    const dataElementOrganisationUnitKey = `${dataElement}_${organisationUnitCode}`;
    const mostRecentFoundSoFar = latestResultsCache[dataElementOrganisationUnitKey] || {};
    // Use responseElement if we haven't already found a matching response element with a more recent period
    if (period === getPreferredPeriod(mostRecentFoundSoFar.period, period)) {
      const arrayIndex =
        mostRecentFoundSoFar.arrayIndex === undefined
          ? filteredResults.length
          : mostRecentFoundSoFar.arrayIndex;
      filteredResults[arrayIndex] = {
        ...responseElement,
        organisationUnit: organisationUnitCode,
      };
      latestResultsCache[dataElementOrganisationUnitKey] = {
        period,
        arrayIndex,
      };
    }
  });
  return filteredResults;
};
