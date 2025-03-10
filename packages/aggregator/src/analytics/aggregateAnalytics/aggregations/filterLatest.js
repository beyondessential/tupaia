import { getPreferredPeriod } from './utils';

/**
 * Filter to get latest period analytics from analytics
 *
 * @param {Array} analytics
 * @param {Object<string, Object<string, string>>} aggregationConfig
 * @returns {Array}
 */
export const filterLatest = (analytics, aggregationConfig) => {
  const { orgUnitMap } = aggregationConfig;
  const filteredAnalytics = [];
  // Hold on to a cache of the latest analytics found for each data element/organisation unit combo
  const latestAnalyticsCache = {};
  analytics.forEach(responseElement => {
    const { dataElement, organisationUnit, period } = responseElement;
    const organisationUnitCode = orgUnitMap?.[organisationUnit]?.code || organisationUnit;
    const dataElementOrganisationUnitKey = `${dataElement}_${organisationUnitCode}`;
    const mostRecentFoundSoFar = latestAnalyticsCache[dataElementOrganisationUnitKey] || {};
    // Use responseElement if we haven't already found a matching response element with a more recent period
    if (period === getPreferredPeriod(mostRecentFoundSoFar.period, period)) {
      const arrayIndex =
        mostRecentFoundSoFar.arrayIndex === undefined
          ? filteredAnalytics.length
          : mostRecentFoundSoFar.arrayIndex;
      filteredAnalytics[arrayIndex] = {
        ...responseElement,
        organisationUnit: organisationUnitCode,
      };
      latestAnalyticsCache[dataElementOrganisationUnitKey] = {
        period,
        arrayIndex,
      };
    }
  });
  return filteredAnalytics;
};
