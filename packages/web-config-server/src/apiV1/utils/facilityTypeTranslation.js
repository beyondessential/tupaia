const OTHER = 'Other';

const basicFacilityTypes = {
  1: 'Hospital',
  2: 'Community health centre',
  3: 'Clinic',
  4: 'Aid post',
};

const specialCasePlurals = {
  Dispensary: 'Dispensaries',
  'National administration': 'National administration',
  'Provincial administration': 'Provincial administration',
  Storage: 'Storage',
};

export const pluraliseFacilityType = facilityType =>
  specialCasePlurals[facilityType] || `${facilityType}s`;

export const translateCategoryCodeToFacilityType = facilityTypeCode =>
  basicFacilityTypes[facilityTypeCode] || OTHER;
