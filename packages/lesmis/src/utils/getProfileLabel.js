/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getProfileLabel = entityType => {
  if (!entityType) {
    return 'Profile';
  }
  switch (entityType) {
    case 'district':
      return 'Province Profile';
    case 'country':
      return 'Country';
    case 'sub_district':
      return 'District Profile';
    default:
      return `${entityType} Profile`;
  }
};
