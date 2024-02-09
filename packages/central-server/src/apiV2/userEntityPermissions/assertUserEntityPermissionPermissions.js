/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import {
  hasBESAdminAccess,
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions';
import {
  getAdminPanelAllowedCountryCodes,
  getAdminPanelAllowedPermissionGroupIdsByCountryIds,
} from '../utilities';
import { assertUserAccountPermissions } from '../userAccounts/assertUserAccountPermissions';

export const assertUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermissionId,
) => {
  const userEntityPermission = await models.userEntityPermission.findById(userEntityPermissionId);
  if (!userEntityPermission) {
    throw new Error(`No user entity permission found with id ${userEntityPermissionId}`);
  }

  const entity = await models.entity.findById(userEntityPermission.entity_id);
  const permissionGroup = await models.permissionGroup.findById(
    userEntityPermission.permission_group_id,
  );
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (!accessibleCountryCodes.includes(entity.country_code)) {
    throw new Error(`Need Admin Panel access to ${entity.country_code}`);
  }

  if (!accessPolicy.allows(entity.code, permissionGroup.name)) {
    throw new Error(`Need ${permissionGroup.name} access to ${entity.code}`);
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
    throw new Error('Need BES Admin access to make this change');
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
  const permissionGroup = await models.permissionGroup.findById(permissionGroupId);
  if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
    throw new Error('Need BES Admin access to make this change');
  }

  const entity = await models.entity.findById(entityId);
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error(`Need Admin Panel access to ${entity.country_code}`);
  }

  if (!accessPolicy.allows(entity.code, permissionGroup.name)) {
    throw new Error(`Need ${permissionGroup.name} access to ${entity.code}`);
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
