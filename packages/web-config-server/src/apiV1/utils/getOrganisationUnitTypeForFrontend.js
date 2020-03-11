export const getOrganisationUnitTypeForFrontend = (type = '') => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case 'country':
      return 'Country';
    case 'region':
    case 'district':
      return 'Region';
    case 'facility':
      return 'Facility';
    case 'village':
      return 'Village';
    default:
      return 'Other';
  }
};
