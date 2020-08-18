/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getCountryCode } from '../../routes/utilities/getCountryCode';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const hasEntitiesImportPermissions = async (accessPolicy, entitiesByCountryName) => {
  const countryCodes = Object.entries(entitiesByCountryName).map(([countryName, entities]) => {
    return getCountryCode(countryName, entities);
  });

  for (let i = 0; i < countryCodes.length; i++) {
    const countryCode = countryCodes[i];

    //If user doesn't have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
    // to ANY of the countries of the entities being imported, it should fail!
    if (!accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new Error(`No permission for country ${countryCode}`);
    }
  }

  return true;
};
