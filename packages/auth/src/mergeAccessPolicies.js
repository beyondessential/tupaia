import { uniq } from 'es-toolkit';

import { isLegacyAccessPolicy } from './isLegacyAccessPolicy';

/**
 * Merge policy1 and policy2 together to form a superset access policy
 * @param {AccessPolicyObject} policy1
 * @param {AccessPolicyObject} policy2
 * @returns {AccessPolicyObject} mergedPolicy
 */
export const mergeAccessPolicies = (policy1, policy2) => {
  if (isLegacyAccessPolicy(policy1) || isLegacyAccessPolicy(policy2)) {
    return policy1; // Merging with legacy access policy is unsupported
  }

  const entitiesWithPermissions = uniq([...Object.keys(policy1), ...Object.keys(policy2)]);
  const mergedPolicy = {};
  entitiesWithPermissions.forEach(entityCode => {
    const policy1Permissions = policy1[entityCode];
    const policy2Permissions = policy2[entityCode];
    if (!policy1Permissions) {
      mergedPolicy[entityCode] = policy2Permissions;
      return;
    }

    if (!policy2Permissions) {
      mergedPolicy[entityCode] = policy1Permissions;
      return;
    }

    mergedPolicy[entityCode] = uniq([...policy1Permissions, ...policy2Permissions]);
  });
  return mergedPolicy;
};
