/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { getAdminPanelAllowedEntityIds } from '../utilities';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequestId) => {
  const accessRequest = await models.accessRequest.findById(accessRequestId);
  if (accessRequest === null) {
    throw new Error(`No access request found with id ${accessRequestId}`);
  }

  const entity = await models.entity.findById(accessRequest.entity_id);
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }
  return true;
};

export const createAccessRequestDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const dbConditions = { ...criteria };
  dbConditions.entity_id = await getAdminPanelAllowedEntityIds(accessPolicy, models);

  return dbConditions;
};
