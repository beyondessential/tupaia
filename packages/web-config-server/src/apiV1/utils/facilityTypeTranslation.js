const OTHER = 'Other';

const basicFacilityTypes = {
  1: 'Hospital',
  2: 'Community health centre',
  3: 'Clinic',
  4: 'Aid post',
};

export function getBasicFacilityTypeName(facilityTypeCode) {
  return basicFacilityTypes[facilityTypeCode] || OTHER;
}

export function getBasicFacilityTypeNamePlural(facilityTypeCode) {
  return `${getBasicFacilityTypeName(facilityTypeCode)}s`;
}
