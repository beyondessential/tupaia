import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import { assertIsNotNullish, ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import {
  BES_ADMIN_PERMISSION_GROUP,
  hasBESAdminAccess,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions';
import { assertUserAccountPermissions } from '../userAccounts/assertUserAccountPermissions';
import {
  getAdminPanelAllowedCountryCodes,
  getAdminPanelAllowedPermissionGroupIdsByCountryIds,
} from '../utilities';

export const assertUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermissionId,
) => {
  const userEntityPermission = ensure(
    await models.userEntityPermission.findById(userEntityPermissionId),
    `No user entity permission exists with ID ${userEntityPermissionId}`,
  );

  const [entity, permissionGroup] = await Promise.all([
    userEntityPermission.entity(),
    userEntityPermission.permissionGroup(),
  ]);

  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (!accessibleCountryCodes.includes(entity.country_code)) {
    throw new PermissionsError(`Need Admin Panel access to ${entity.country_code}`);
  }

  if (!accessPolicy.allows(entity.code, permissionGroup.name)) {
    throw new PermissionsError(`Need ${permissionGroup.name} access to ${entity.code}`);
  }

  return true;
};

export const assertUserEntityPermissionEditPermissions = async (
  accessPolicy,
  models,
  userEntityPermissionId,
  updatedFields = {},
) => {
  // Check we have permission to access the record we're trying to edit
  await assertUserEntityPermissionPermissions(accessPolicy, models, userEntityPermissionId);
  const userEntityPermission = await models.userEntityPermission.findById(userEntityPermissionId);
  const userEntityPermissionData = await userEntityPermission.getData();
  // Check we have permission for the changes
  await assertUserEntityPermissionUpsertPermissions(accessPolicy, models, {
    ...userEntityPermissionData,
    ...updatedFields,
  });

  // Final check to make sure we're not editing a BES admin access permission
  // Changing any of the pieces of data in a BES admin UEP is abusable, so completely forbid it
  const permissionGroup = await userEntityPermission.permissionGroup();
  if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
    throw new PermissionsError('Need BES Admin access to make this change');
  }

  return true;
};

export const assertUserEntityPermissionUpsertPermissions = async (
  accessPolicy,
  models,
  { user_id: userId, permission_group_id: permissionGroupId, entity_id: entityId },
) => {
  // Check we're not trying to give someone:
  // BES admin access
  // Access to an entity we don't have admin panel access
  const permissionGroup = ensure(
    await models.permissionGroup.findById(permissionGroupId),
    `No permission group exists with ID ${permissionGroupId}`,
  );
  if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
    throw new PermissionsError('Need BES Admin access to make this change');
  }

  const entity = ensure(
    await models.entity.findById(entityId),
    `No entity exists with ID ${entityId}`,
  );
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new PermissionsError(
      `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${entity.country_code}`,
    );
  }

  if (!accessPolicy.allows(entity.code, permissionGroup.name)) {
    throw new PermissionsError(`Need ${permissionGroup.name} access to ${entity.code}`);
  }

  await assertUserAccountPermissions(accessPolicy, models, userId);
};

/**
 * Filter to check if the entity permission is within our access policy.
 *
 * eg. { DL: [Admin, Public], TO: ['Donor'] }
 * =>
 *  (entity = 'DL' AND permission_group IN ('Admin', 'Public')
 *  OR (entity = 'TO' AND permission_group IN ('Donor')
 */
const buildRawSqlUserEntityPermissionsFilter = async (accessPolicy, models) => {
  const allowedPermissionIdsByCountryIds = await getAdminPanelAllowedPermissionGroupIdsByCountryIds(
    accessPolicy,
    models,
  );
  const sql = Object.values(allowedPermissionIdsByCountryIds)
    .map(
      permissionGroupIds =>
        `(user_entity_permission.entity_id = ? AND user_entity_permission.permission_group_id IN ${SqlQuery.record(
          permissionGroupIds,
        )})`,
    )
    .join(' OR ');

  const parameters = Object.entries(allowedPermissionIdsByCountryIds).flat(Infinity);
  return { sql, parameters };
};

export const createUserEntityPermissionDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  // If we don't have BES Admin access, add a filter to the SQL query
  const rawSqlFilter = await buildRawSqlUserEntityPermissionsFilter(accessPolicy, models);
  if (!criteria || Object.keys(criteria).length === 0) {
    // No given criteria, just return raw SQL
    return {
      [QUERY_CONJUNCTIONS.RAW]: rawSqlFilter,
    };
  }

  return {
    ...criteria,
    [QUERY_CONJUNCTIONS.AND]: {
      [QUERY_CONJUNCTIONS.RAW]: rawSqlFilter,
    },
  };
};
