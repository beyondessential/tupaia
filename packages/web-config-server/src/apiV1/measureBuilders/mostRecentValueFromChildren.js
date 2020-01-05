import { AGGREGATION_TYPES } from '/dhis';
import { getChildOrganisationUnits, mapFacilityIdsToGroupCodes } from '/apiV1/utils';
import { Facility, Entity } from '/models';
const { MOST_RECENT_PER_ORG_GROUP } = AGGREGATION_TYPES;

export const mostRecentValueFromChildren = async (
  dhisApi,
  { organisationUnitGroupCode, dataElementCode },
  { organisationUnitLevel },
) => {
  const organisationUnits = await getChildOrganisationUnits(
    {
      level: organisationUnitLevel,
      organisationUnitGroupCode,
    },
    dhisApi,
  );
  const jsonQueryData = {
    dataElementCodes: [dataElementCode],
    organisationUnitCode: organisationUnitGroupCode,
  };
  const facilityIdsToGroupCodes = mapFacilityIdsToGroupCodes(organisationUnits);
  const { results } = await dhisApi.getAnalytics(jsonQueryData, {}, MOST_RECENT_PER_ORG_GROUP, {
    facilityIdsToGroupCodes,
  });
  const orgUnitValuePromises = organisationUnits.map(async ({ id, code }) => {
    console.log(code);
    const entity = await Entity.findOne({ code });
    console.log(entity);
    console.log('*************************');
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
      results.find(result => result.organisationUnit === id) || {};
    return {
      [dataElementCode]: value,
      ...entityMetadata,
      organisationUnitCode: code,
      period,
    };
  });
  return Promise.all(orgUnitValuePromises);
};
