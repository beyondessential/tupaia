export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
