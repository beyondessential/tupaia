import {
  parseFacilityTypeData,
  sortFacilityTypesByLevel,
  getBasicFacilityTypeNamePlural,
  getAllFacilityTypesOfFacilities,
  getFacilityStatuses,
  filterOutOrganisationUnitsNotInWorld,
} from '/apiV1/utils';

// Number of Operational Facilities by Facility Type
export const countOperationalFacilitiesByType = async ({ query }, aggregator, dhisApi) => {
  // Retrieve organisation units and the groups they are in
  const organisationUnits = await dhisApi.getOrganisationUnits(
    {
      filter: [{ 'ancestors.code': '{organisationUnitCode}' }],
      fields: 'code,organisationUnitGroups[code]',
    },
    query,
  );

  const facilityStatusesByCode = await getFacilityStatuses(
    aggregator,
    query.organisationUnitCode,
    query.period,
    true,
  );

  // exclude facilities that have not been surveyed -- if they're present in the
  // analytics result at all (whether true or false) then they've been surveyed
  const checkSurveyed = ({ code }) => facilityStatusesByCode.hasOwnProperty(code);
  const surveyedOrganisationUnits = organisationUnits.filter(checkSurveyed);

  // If we are running this for the world dashboard, exclude any facilities in countries that should
  // not show up on the world dashboard
  const isForWorld = query.organisationUnitCode === 'World';
  const facilitiesToInclude = isForWorld
    ? filterOutOrganisationUnitsNotInWorld(surveyedOrganisationUnits)
    : surveyedOrganisationUnits;
  const allFacilityTypes = getAllFacilityTypesOfFacilities(facilitiesToInclude);

  let facilityTypeCounts = {};
  allFacilityTypes.forEach(row => {
    const facilityTypeData = parseFacilityTypeData(row.code);

    // To have a cohesive aggregation of facility types across the world, we use the standard
    // facility type levels 1, 2, 3, & 4. Countries may use specific facility types, but each
    // must have a level that comes within one of the four standard levels, e.g. 1.4 or 3.1
    let facilityType = isForWorld
      ? getBasicFacilityTypeNamePlural(Math.trunc(facilityTypeData.facilityTypeLevel))
      : facilityTypeData.facilityTypeCode;

    if (!facilityType) {
      facilityType = 'Not specified';
    }

    if (facilityTypeCounts[facilityType]) {
      facilityTypeCounts[facilityType].value++;
    } else {
      facilityTypeCounts[facilityType] = {
        name: facilityType,
        value: 1,
      };

      // Add level number if using the aggregation server for codes
      facilityTypeCounts[facilityType].level = facilityTypeData.facilityTypeLevel;
    }
  });

  // Convert data to array and if using the aggregation server for codes, sort by level
  facilityTypeCounts = Object.values(facilityTypeCounts);
  facilityTypeCounts = sortFacilityTypesByLevel(facilityTypeCounts);

  return { data: facilityTypeCounts };
};
