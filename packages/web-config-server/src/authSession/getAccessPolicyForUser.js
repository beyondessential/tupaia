/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import set from 'lodash.set';

import { UserSession } from '/models';
import {
  PUBLIC_USER_NAME,
  PUBLIC_USER_BASE_ACCESS_POLICY,
  PUBLIC_COUNTRY_CODES,
} from './publicAccess';

async function getBaseAccessPolicyForUser(userName) {
  if (userName === PUBLIC_USER_NAME) {
    return PUBLIC_USER_BASE_ACCESS_POLICY;
  }
  const userSession = await UserSession.findOne({ userName });
  return userSession.accessPolicy;
}

export async function getAccessPolicyForUser(userName) {
  const basePolicy = await getBaseAccessPolicyForUser(userName);
  const countryPermissions = basePolicy.permissions.reports._items; // eslint-disable-line no-underscore-dangle

  // Add public permissions for reports to all countries (for all users).
  PUBLIC_COUNTRY_CODES.forEach(countryCode => {
    set(countryPermissions, [countryCode, '_access', 'Public'], true);
  });

  // Demo Land also gets Donor and Admin permission for all users
  set(countryPermissions, ['DL', '_access', 'Donor'], true);
  set(countryPermissions, ['DL', '_access', 'Admin'], true);

  return basePolicy;
}
