export const getPermissionListWithWildcard = async accessPolicy => {
  const userPermissionGroups = accessPolicy.getPermissionGroups();
  return ['*', ...userPermissionGroups];
};
