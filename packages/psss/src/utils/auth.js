/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

export const checkIsAuthorisedForMultiCountry = user => getEntitiesAllowed(user).length > 1;

export const checkIsAuthorisedForCountry = (user, match) =>
  getEntitiesAllowed(user).some(entityCode => entityCode === match.params.countryCode);

export const getEntitiesAllowed = user => {
  if (!user) {
    return [];
  }

  return new AccessPolicy(user.accessPolicy).getEntitiesAllowed('Admin');
};
