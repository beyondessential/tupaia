import { AccessPolicy } from '@tupaia/access-policy';

import { PUBLIC_USER_NAME, PUBLIC_COUNTRY_CODES } from './publicAccess';

async function getBaseAccessPolicyForUser(authenticator, userId) {
  if (userId === PUBLIC_USER_NAME) {
    return {};
  }
  return authenticator.getAccessPolicyForUser(userId);
}

export async function getAccessPolicyForUser(authenticator, userId) {
  const policy = await getBaseAccessPolicyForUser(authenticator, userId);

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
