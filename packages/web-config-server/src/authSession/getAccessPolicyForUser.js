/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';

import { UserSession } from '/models';
import { PUBLIC_USER_NAME, PUBLIC_COUNTRY_CODES } from './publicAccess';

async function getBaseAccessPolicyForUser(userName) {
  if (userName === PUBLIC_USER_NAME) {
    return {};
  }
  const userSession = await UserSession.findOne({ userName });
  return userSession.accessPolicy;
}

export async function getAccessPolicyForUser(userName) {
  const policy = await getBaseAccessPolicyForUser(userName);

  // Add public permissions for reports to all countries (for all users).
  PUBLIC_COUNTRY_CODES.forEach(countryCode => {
    if (!policy[countryCode]) {
      policy[countryCode] = [];
    }
    policy[countryCode].push('Public');
  });

  // Demo Land also gets Donor and Admin permission for all users
  policy.DL.push('Donor', 'Admin');

  return new AccessPolicy(policy);
}
