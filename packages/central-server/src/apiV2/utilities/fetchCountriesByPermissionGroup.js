// Generate lists of country ids we have access to per permission group id
export const fetchCountryIdsByPermissionGroupId = async (accessPolicy, models) => {
  const countryCodesByPermissionGroupId =
    await models.permissionGroup.fetchCountryCodesByPermissionGroupId(accessPolicy);

  // Transform arrays of codes to arrays of ids
  const allCountryCodes = accessPolicy.getEntitiesAllowed();
  const countryCodeToId = await models.country.findIdByCode(allCountryCodes);
  const countryIdsByPermissionGroupId = {};
  for (const [permissionGroupId, countryCodes] of Object.entries(countryCodesByPermissionGroupId)) {
    countryIdsByPermissionGroupId[permissionGroupId] = countryCodes.map(c => countryCodeToId[c]);
  }
  return countryIdsByPermissionGroupId;
};
