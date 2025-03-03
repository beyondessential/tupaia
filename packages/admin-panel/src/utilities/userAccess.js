const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
const VIZ_BUILDER_PERMISSION_GROUP = 'Viz Builder User';

// Assume that if a user has any BES Admin access, they are an internal user,
// to avoid having to check permissions for every country
export const getHasBESAdminAccess = user => {
  if (!user || !user.accessPolicy) return false;
  return Object.keys(user.accessPolicy).some(countryCode =>
    user.accessPolicy[countryCode].some(
      permissionGroupName => permissionGroupName === BES_ADMIN_PERMISSION_GROUP,
    ),
  );
};

export const getHasVizBuilderAccess = user => {
  if (!user || !user.accessPolicy) return false;
  return Object.keys(user.accessPolicy).some(countryCode =>
    user.accessPolicy[countryCode].some(
      permissionGroupName => permissionGroupName === VIZ_BUILDER_PERMISSION_GROUP,
    ),
  );
};
