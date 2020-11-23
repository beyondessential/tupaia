/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// Generate lists of country codes we have access to per permission group id
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

// Generate lists of country ids we have access to per permission group id
export const fetchCountryIdsByPermissionGroupId = async (accessPolicy, models) => {
  const countryCodesByPermissionGroupId = await fetchCountryCodesByPermissionGroupId(
    accessPolicy,
    models,
  );

  // Transform arrays of codes to arrays of ids
  const allCountryCodes = accessPolicy.getEntitiesAllowed();
  const countryCodeToId = await models.country.findIdByCode(allCountryCodes);
  const countryIdsByPermissionGroupId = {};
  for (const [permissionGroupId, countryCodes] of Object.entries(countryCodesByPermissionGroupId)) {
    countryIdsByPermissionGroupId[permissionGroupId] = countryCodes.map(c => countryCodeToId[c]);
  }
  return countryIdsByPermissionGroupId;
};
