/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import { hasBESAdminAccess, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import {
  getAdminPanelAllowedCountryCodes,
  getAdminPanelAllowedPermissionGroupIdsByCountryIds,
} from '../utilities';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequestId) => {
  const accessRequest = await models.accessRequest.findById(accessRequestId);
  if (!accessRequest) {
    throw new Error(`No access request found with id ${accessRequestId}`);
  }

  const entity = await models.entity.findById(accessRequest.entity_id);
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (!accessibleCountryCodes.includes(entity.country_code)) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }

  if (accessRequest.permission_group_id) {
    const permissionGroup = await models.permissionGroup.findById(
      accessRequest.permission_group_id,
    );

    if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
      throw new Error(`Need ${permissionGroup.name} access to ${entity.country_code}`);
    }
  }

  return true;
};

export const assertAccessRequestEditPermissions = async (
  accessPolicy,
  models,
  accessRequestId,
  updatedFields,
) => {
  // Check we have basic permission to access the record we want to edit
  await assertAccessRequestPermissions(accessPolicy, models, accessRequestId);
  // Check we have permission for the change
  await assertAccessRequestUpsertPermissions(accessPolicy, models, updatedFields);

  // We can view access requests for BES admin access even if we don't have BES admin ourselves
  // So this final check confirms we're not trying to approve a request for BES admin access
  const accessRequest = await models.accessRequest.findById(accessRequestId);
  const permissionGroup = await models.permissionGroup.findById(accessRequest.permission_group_id);
  if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }

  return true;
};

export const assertAccessRequestUpsertPermissions = async (
  accessPolicy,
  models,
  { permission_group_id: permissionGroupId, entity_id: entityId },
) => {
  const entity = await models.entity.findById(entityId);
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (!accessibleCountryCodes.includes(entity.country_code)) {
    throw new Error('Need access to the newly edited entity');
  }

  if (permissionGroupId) {
    // Check we're not trying to change this access request to give someone:
    // BES admin access
    // Access to an entity we don't have admin panel access
    const permissionGroup = await models.permissionGroup.findById(permissionGroupId);
    if (permissionGroup.name === BES_ADMIN_PERMISSION_GROUP) {
      throw new Error('Need BES Admin access to make this change');
    }

    if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
      throw new Error(`Need ${permissionGroup.name} access to ${entity.country_code}`);
    }
  }
};

/**
 * Filter to check if the entity permission is within our access policy.
 *
 * eg. { DL: [Admin, Public], TO: ['Donor'] }
 * =>
 *  (entity = 'DL' AND (permission_group IS NULL OR permission_group IN ('Admin', 'Public'))
 *  OR (entity = 'TO' AND (permission_group IS NULL OR permission_group IN ('Donor'))
 */
const buildRawSqlAccessRequestFilter = async (accessPolicy, models) => {
  const allowedPermissionIdsByCountryIds = await getAdminPanelAllowedPermissionGroupIdsByCountryIds(
    accessPolicy,
    models,
  );
  const sql = Object.values(allowedPermissionIdsByCountryIds)
    .map(
      permissionGroupIds =>
        `(access_request.entity_id = ? AND (access_request.permission_group_id IS NULL OR access_request.permission_group_id IN ${SqlQuery.record(
          permissionGroupIds,
        )}))`,
    )
    .join(' OR ');

  const parameters = Object.entries(allowedPermissionIdsByCountryIds).flat(Infinity);
  return { sql, parameters };
};

export const createAccessRequestDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const rawSqlFilter = await buildRawSqlAccessRequestFilter(accessPolicy, models);
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
