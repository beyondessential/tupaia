import { getChildOrganisationUnits, mapOrgUnitToGroupCodes } from '/apiV1/utils';
import { analyticsToMeasureData } from './helpers';

export const mostRecentValueFromChildren = async (
  aggregator,
  dhisApi,
  { dataElementCode },
  { aggregationEntityType, dataServices },
  entity,
) => {
  const organisationUnits = await getChildOrganisationUnits(
    {
      type: aggregationEntityType,
      organisationUnitGroupCode: entity.code,
    },
    dhisApi,
  );

  const orgUnitToGroupKeys = mapOrgUnitToGroupCodes(organisationUnits);
  const { results } = await aggregator.fetchAnalytics(
    [dataElementCode],
    { dataServices, organisationUnitCode: entity.code },
    {},
    {
      aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP,
      aggregationConfig: { orgUnitToGroupKeys },
    },
  );

  return analyticsToMeasureData(results);
};
