/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

export const checkIsAuthorisedForCountry = (match, user) => {
  const activeEntity = getActiveEntityByUser(user);

  if (activeEntity === 'World') {
    return true;
  }

  return activeEntity.toLowerCase() === match.params.countryName;
};

export const checkIsAuthorisedForMultiCountry = (match, user) => {
  const activeEntity = getActiveEntityByUser(user);
  return activeEntity === 'World';
};

export const getActiveEntityByUser = user => {
  const accessPolicy = new AccessPolicy(user.accessPolicy);
  // Todo: Update with the correct access policy check

  // To Test switch between Admin and Public
  const worldPermission = accessPolicy.allows('DL', 'Admin');
  if (worldPermission) {
    return 'World';
  }
  // console.log('access policy', user.accessPolicy);
  // Todo: Return the correct activeCountry
  return 'AS';
};
