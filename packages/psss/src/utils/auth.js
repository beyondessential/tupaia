/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

export const checkIsAuthorisedForMultiCountry = user => getEntitiesAllowedByUser(user).length > 1;

export const checkIsAuthorisedForCountry = (user, match) =>
  getEntitiesAllowedByUser(user).some(
    entityCode => entityCode.toLowerCase() === match.params.countryCode,
  );

export const getEntitiesAllowedByUser = user => {
  if (!user) {
    return [];
  }

  const entities = new AccessPolicy(user.accessPolicy).getEntitiesAllowed('PSSS');
  // Todo: filter this list to countries only
  console.log('entities allowed', entities);
  return entities.map(e => e.toLowerCase()); // always use lowercase entities
};
