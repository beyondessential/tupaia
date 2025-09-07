export const fetchCountryCodesByPermissionGroupId = async (accessPolicy, models) => {
  const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroupId = {};
  const permissionGroupNameToId = await models.permissionGroup.findIdByField(
    'name',
    allPermissionGroupsNames,
  );
  for (const [permissionGroupName, permissionGroupId] of Object.entries(permissionGroupNameToId)) {
    const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
    countryCodesByPermissionGroupId[permissionGroupId] = countryCodes;
  }
  return countryCodesByPermissionGroupId;
};
