import { getChildOrganisationUnits, mapOrgUnitToGroupCodes } from '/apiV1/utils';
import { analyticsToMeasureData } from './helpers';

export const mostRecentValueFromChildren = async (
  aggregator,
  dhisApi,
  { organisationUnitGroupCode, dataElementCode },
  { aggregationEntityType, dataServices },
) => {
  const organisationUnits = await getChildOrganisationUnits(
    {
      level: aggregationEntityType,
      organisationUnitGroupCode,
    },
    dhisApi,
  );

  const orgUnitToGroupKeys = mapOrgUnitToGroupCodes(organisationUnits);
  const { results } = await aggregator.fetchAnalytics(
    [dataElementCode],
    { dataServices, organisationUnitCode: organisationUnitGroupCode },
    {},
    {
      aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP,
      aggregationConfig: { orgUnitToGroupKeys },
    },
  );

  return analyticsToMeasureData(results);
};
