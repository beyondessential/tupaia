// Assume that if a user has any BES Admin access, they are an internal user, to avoid having to check permissions for every country
export const getHasBESAdminAccess = user => {
  if (!user || !user.accessPolicy) return false;
  return Object.keys(user.accessPolicy).some(countryCode =>
    user.accessPolicy[countryCode].some(permissionGroupName => permissionGroupName === 'BES Admin'),
  );
};
