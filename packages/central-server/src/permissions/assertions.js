import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';

/* Re-export for backward compatibility. Prefer importing directly from @tupaia/access-policy. */
export {
  allowNoPermissions,
  assertAdminPanelAccess,
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertPermissionGroupAccess,
  assertPermissionGroupsAccess,
  assertVizBuilderAccess,
  hasBESAdminAccess,
  hasPermissionGroupAccess,
  hasPermissionGroupsAccess,
  hasSomePermissionGroupsAccess,
  hasTupaiaAdminPanelAccess,
  hasTupaiaAdminPanelAccessToCountry,
  hasVizBuilderAccess,
} from '@tupaia/access-policy';

/**
 * @param {import('@tupaia/access-policy').AccessPolicy} accessPolicy
 * @param {typeof import('@tupaia/database').ModelRegistry')} models
 * @param {string} recordId
 * @returns {Promise<true>}
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
