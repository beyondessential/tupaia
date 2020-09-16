/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

export const checkIsAuthorisedForMultiCountry = user =>
  getPermittedEntitiesForUser(user).length > 1;

export const checkIsAuthorisedForCountry = (user, match) =>
  getPermittedEntitiesForUser(user).some(entityCode => entityCode === match.params.countryCode);

export const getPermittedEntitiesForUser = user => {
  if (!user) {
    return [];
  }

  // Todo: Update with the correct access policy check
  // @see: https://github.com/beyondessential/tupaia-backlog/issues/1268
  const accessPolicy = new AccessPolicy(user.accessPolicy);

  // For testing...
  // return ['as', 'to'];
  return ['to'];
};
