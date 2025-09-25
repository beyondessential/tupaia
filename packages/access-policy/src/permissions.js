import { BES_ADMIN_PERMISSION_GROUP } from '@tupaia/constants';

export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
