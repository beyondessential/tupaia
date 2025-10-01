import { BES_ADMIN_PERMISSION_GROUP } from '@tupaia/constants';

/**
 * @param {import('./AccessPolicy').AccessPolicy} accessPolicy
 * @returns {boolean}
 */
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
