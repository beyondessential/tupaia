/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import {
  getAdminPanelAllowedEntityIds,
  getAdminPanelAllowedCountryCodes,
  mergeFilter,
} from '../utilities';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequestId) => {
  const accessRequest = await models.accessRequest.findById(accessRequestId);
  if (!accessRequest) {
    throw new Error(`No access request found with id ${accessRequestId}`);
  }

  const entity = await models.entity.findById(accessRequest.entity_id);
  const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
  if (accessibleCountryCodes.includes(entity.country_code)) {
    return true;
  }
  throw new Error('Need Admin Panel access to the country this access request is for');
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
    throw new Error('Need BES Admin access to make this change');
  }

  return true;
};

export const assertAccessRequestUpsertPermissions = async (
  accessPolicy,
  models,
  { permission_group_id: permissionGroupId, entity_id: entityId },
) => {
  // Check we're not trying to change this access request to give someone:
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
    const accessibleCountryCodes = getAdminPanelAllowedCountryCodes(accessPolicy);
    if (!accessibleCountryCodes.includes(entity.country_code)) {
      throw new Error('Need access to the newly edited entity');
    }
  }
};

export const createAccessRequestDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const dbConditions = { ...criteria };
  dbConditions['access_request.entity_id'] = mergeFilter(
    await getAdminPanelAllowedEntityIds(accessPolicy, models),
    dbConditions['access_request.entity_id'],
  );

  return dbConditions;
};
