import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
/* Re-export for backward compatibility. Prefer importing directly from @tupaia/access-policy. */
export {
  allowNoPermissions,
  assertAllPermissions,
  assertAnyPermissions,
  hasBESAdminAccess,
  hasVizBuilderAccess,
  hasPermissionGroupAccess,
  hasPermissionGroupsAccess,
  hasSomePermissionGroupsAccess,
  assertBESAdminAccess,
  assertVizBuilderAccess,
  hasTupaiaAdminPanelAccess,
  hasTupaiaAdminPanelAccessToCountry,
  assertAdminPanelAccess,
  assertPermissionGroupAccess,
  assertPermissionGroupsAccess,
} from '@tupaia/access-policy';

/**
 * @type {PermissionsAssertion}
 * @param {ModelRegistry} models
 * @param {string} recordId
 */
export const assertAdminPanelAccessToCountry = async (accessPolicy, models, recordId) => {
  const entity = ensure(
    await models.entity.findById(recordId),
    `No entity exists with ID ${recordId}`,
  );
  const userHasAdminAccessToCountry = accessPolicy.allows(
    entity.country_code,
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  if (!userHasAdminAccessToCountry) {
    throw new PermissionsError(
      `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to country ‘${entity.country_code}’ to edit entity ‘${entity.name}’`,
    );
  }
  return true;
};
