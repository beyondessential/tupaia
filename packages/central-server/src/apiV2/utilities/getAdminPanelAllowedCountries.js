import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

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

  if (accessibleAdminPanelCountryCodes.length === 0) {
    throw new Error('You do not have Tupaia Admin Panel access to any entities');
  }

  return accessibleAdminPanelCountryCodes;
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

/**
 * Get a mapping of countryIds to permissionGroupIds for countries that the user has Tupaia Admin Panel access to
 */
export const getAdminPanelAllowedPermissionGroupIdsByCountryIds = async (accessPolicy, models) => {
  const allowedCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  return Object.fromEntries(
    await Promise.all(
      allowedCountryCodes.map(async countryCode => [
        (await models.entity.findOne({ code: countryCode })).id,
        (
          await models.permissionGroup.find({
            name: accessPolicy.getPermissionGroups([countryCode]),
          })
        ).map(({ id }) => id),
      ]),
    ),
  );
};
