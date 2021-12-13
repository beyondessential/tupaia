/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import {
  hasBESAdminAccess,
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions';
import { getAdminPanelAllowedEntityIds, getAdminPanelAllowedCountryCodes } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

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
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (accessibleCountryCodes.includes(entity.country_code)) {
    return true;
  }
  throw new Error('Need Admin Panel access to the country this entity is in');
};

export const assertUserEntityPermissionEditPermissions = async (
  accessPolicy,
  models,
  userEntityPermissionId,
  updatedFields = {},
) => {
  // Check we have permission to access the record we're trying to edit
  await assertUserEntityPermissionPermissions(accessPolicy, models, userEntityPermissionId);
  // Check we have permission for the changes
  await assertUserEntityPermissionUpsertPermissions(accessPolicy, models, updatedFields);

  // Final check to make sure we're not editing a BES admin access permission
  // Changing any of the pieces of data in a BES admin UEP is abusable, so completely forbid it
  const userEntityPermission = await models.userEntityPermission.findById(userEntityPermissionId);
  const permissionGroup = await userEntityPermission.permissionGroup();
  if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
    throw new Error('Need BES Admin access to make this change');
  }

  return true;
};

export const assertUserEntityPermissionUpsertPermissions = async (
  accessPolicy,
  models,
  { permission_group_id: permissionGroupId, entity_id: entityId },
) => {
  // Check we're not trying to give someone:
  // BES admin access
  // Access to an entity we don't have admin panel access
  if (permissionGroupId) {
    const permissionGroup = await models.permissionGroup.findById(permissionGroupId);
    if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
      throw new Error('Need BES Admin access to make this change');
    }
  }
  if (entityId) {
    const entity = await models.entity.findById(entityId);
    if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new Error('Need Admin Panel access to the updated entity');
    }
  }
};

export const createUserEntityPermissionDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query

  const dbConditions = { ...criteria };
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);

  const entities = await models.entity.find({
    code: accessibleCountryCodes,
  });

  const entityIds = entities.map(e => e.id);
  // Checks list of entity ids the user has access to is contained within the list of entity ids
  // the accessPolicy permits (plus Demo Land)

  dbConditions[RAW] = {
    sql: `array(select entity_id from user_entity_permission uep where uep.user_id = user_account.id) <@ array[${entityIds
      .map(() => '?')
      .join(',')}]`,
    parameters: entityIds,
  };

  return dbConditions;
};
