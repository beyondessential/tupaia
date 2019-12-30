// Facility type code structure:
// `FacilityType_${countryCode}_${facilityTypeLevel}_${facilityTypeCode}`
// Example: 'FacilityType_KI_1_Health Centres'
const FACILITY_TYPE_CODE_PREFIX = 'FacilityType';
const FACILITY_TYPE_DELIMITER = '_';

// Returns facility type data given an organisation unit group code
export const parseFacilityTypeData = code => {
  const [countryCode, facilityTypeLevel, facilityTypeCode] = code
    .split(FACILITY_TYPE_DELIMITER)
    .slice(1);
  return { countryCode, facilityTypeLevel, facilityTypeCode };
};

// Filters out all organisation unit groups which are not facility types
const getOnlyFacilityTypeGroups = groups =>
  groups.filter(group => group.code.indexOf(FACILITY_TYPE_CODE_PREFIX) === 0);

// Returns an array with all organisation unit groups that are facility types
export const getAllFacilityTypesOfFacilities = organisationUnits =>
  organisationUnits.reduce(
    (facilityTypes, unit) =>
      facilityTypes.concat(getOnlyFacilityTypeGroups(unit.organisationUnitGroups)),
    [],
  );

export const sortFacilityTypesByLevel = facilityData =>
  facilityData.sort((a, b) => a.level - b.level);

export const filterOutOrganisationUnitsNotInWorld = organisationUnits =>
  organisationUnits.filter(organisationUnit =>
    organisationUnit.organisationUnitGroups.some(({ code }) => code === 'World'),
  );
