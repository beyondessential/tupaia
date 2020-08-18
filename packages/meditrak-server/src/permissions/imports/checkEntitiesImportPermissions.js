/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getCountryCode } from '../../routes/utilities/getCountryCode';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const checkEntitiesImportPermissions = async (
  accessPolicy,
  models,
  entitiesByCountryName,
) => {
  const countryCodes = Object.entries(entitiesByCountryName).map(([countryName, entities]) => {
    return getCountryCode(countryName, entities);
  });

  const countryEntities = await models.entity.find({ code: countryCodes });

  for (let i = 0; i < countryEntities.length; i++) {
    const countryEntity = countryEntities[i];

    //If user doesn't have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
    // to ANY of the countries of the entities being imported, it should fail!
    if (!accessPolicy.allows(countryEntity, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      return false;
    }
  }

  return true;
};
