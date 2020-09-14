/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

export const checkIsAuthorisedForMultiCountry = user => {
  const activeEntity = getActiveEntityByUser(user);
  return Array.isArray(activeEntity);
};

export const checkIsAuthorisedForCountry = (user, match) => {
  if (checkIsAuthorisedForMultiCountry(user)) {
    return true;
  }

  return getActiveEntityByUser(user) === match.params.countryCode;
};

export const getActiveEntityByUser = user => {
  if (!user) {
    return null;
  }

  const accessPolicy = new AccessPolicy(user.accessPolicy);
  // Todo: Update with the correct access policy check
  // @see: https://github.com/beyondessential/tupaia-backlog/issues/1268

  // To Test switch between Admin and Public
  const psssPermissions = accessPolicy.allows('DL', 'Admin');
  if (psssPermissions) {
    return ['as', 'to'];
  }
  // Todo: Return the correct activeCountry
  // return as lower case for consistency
  return 'as';
};
