export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

/**
 * @param {import('./AccessPolicy').AccessPolicy} accessPolicy
 * @returns {boolean}
 */
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
