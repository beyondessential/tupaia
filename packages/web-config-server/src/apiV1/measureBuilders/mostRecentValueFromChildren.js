import { getChildOrganisationUnits, mapOrgUnitToGroupCodes } from '/apiV1/utils';
import { Facility, Entity } from '/models';

export const mostRecentValueFromChildren = async (
  aggregator,
  dhisApi,
  { organisationUnitGroupCode, dataElementCode },
  { organisationUnitLevel, dataServices },
) => {
  const organisationUnits = await getChildOrganisationUnits(
    {
      level: organisationUnitLevel,
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
  const orgUnitValuePromises = organisationUnits.map(async ({ code }) => {
    const entity = await Entity.findOne({ code });
    const entityMetadata = {
      name: entity.name,
      photoUrl: entity.photo_url,
      orgUnitLevel: entity.getOrganisationLevel(),
    };
    const facility = await Facility.findOne({ code });
    if (facility) {
      entityMetadata.facilityTypeName = facility.type_name;
      entityMetadata.facilityTypeCode = facility.type;
    }
    const { value = null, period = null } =
      results.find(result => result.organisationUnit === code) || {};
    return {
      [dataElementCode]: value,
      ...entityMetadata,
      organisationUnitCode: code,
      period,
    };
  });
  return Promise.all(orgUnitValuePromises);
};
