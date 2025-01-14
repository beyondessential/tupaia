/**
 * Replace the org unit in each analytic with the org group from orgUnitMap
 *
 * @param {Array} analytics
 * @param {Object} aggregationConfig
 */
export const replaceOrgUnitWithOrgGroup = (analytics, aggregationConfig) => {
  const { orgUnitMap } = aggregationConfig;
  return analytics.map(analytic => {
    const organisationUnit =
      (orgUnitMap[analytic.organisationUnit] && orgUnitMap[analytic.organisationUnit].code) ||
      analytic.organisationUnit;
    return { ...analytic, organisationUnit };
  });
};
