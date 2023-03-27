/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  LESMIS_ADMIN_PERMISSION_GROUP,
} from '../../permissions';

/*
 * Get a list of country codes this user has tupaia admin panel access to, or throw an error if they have none
 *
 * @param {AccessPolicy}  accessPolicy
 *
 * @returns string[] The country codes
 */

export const getAdminPanelAllowedCountryCodes = accessPolicy => {
  const accessibleAdminPanelCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );

  const accessibleLESMISAdminCountryCodes = accessPolicy.getEntitiesAllowed(
    LESMIS_ADMIN_PERMISSION_GROUP,
  );

  const accessibleCountryCodes = [
    ...accessibleAdminPanelCountryCodes,
    ...accessibleLESMISAdminCountryCodes,
  ];

  if (accessibleCountryCodes.length === 0) {
    throw new Error('You do not have Tupaia Admin Panel access to any entities');
  }

  return accessibleCountryCodes;
};

/*
 * Get a list of country ids this user has tupaia admin panel access to, or throw an error if they have none
 *
 * @param {AccessPolicy}  accessPolicy
 * @param {ModelRegistry} models
 *
 * @returns string[] The entity ids
 */

export const getAdminPanelAllowedCountryIds = async (accessPolicy, models) => {
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  const entities = await models.entity.find({
    code: accessibleCountryCodes,
  });

  return entities.map(e => e.id);
};
