// Facility type code structure:
// `FacilityType_${countryCode}_${facilityTypeLevel}_${facilityTypeCode}`
// Example: 'FacilityType_KI_1_Health Centres'
const FACILITY_TYPE_DELIMITER = '_';

// Returns facility type data given an organisation unit group code
export const parseFacilityTypeData = code => {
  const [countryCode, facilityTypeLevel, facilityTypeCode] = code
    .split(FACILITY_TYPE_DELIMITER)
    .slice(1);
  return { countryCode, facilityTypeLevel, facilityTypeCode };
};

export const filterOutOrganisationUnitsNotInWorld = organisationUnits =>
  organisationUnits.filter(organisationUnit =>
    organisationUnit.organisationUnitGroups.some(({ code }) => code === 'World'),
  );
