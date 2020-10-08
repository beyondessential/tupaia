/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { getAdminPanelAllowedEntityIds } from '../utilities';

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
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to the country this entity is in');
  }
  return true;
};

export const createUserEntityPermissionDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const dbConditions = { ...criteria };
  dbConditions.entity_id = await getAdminPanelAllowedEntityIds(accessPolicy, models);

  return dbConditions;
};
