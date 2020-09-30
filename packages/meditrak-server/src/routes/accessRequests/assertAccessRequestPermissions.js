/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequest) => {
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
  const dbConditions = criteria;
  const accessibleCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  accessibleCountryCodes.push('DL'); // If we have admin panel anywhere, we can also view Demo Land
  const entities = await models.entity.find({
    code: accessibleCountryCodes,
  });
  const entityIds = entities.map(e => e.id);
  dbConditions.entity_id = entityIds;

  return dbConditions;
};
