/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const createAdminPanelDBFilter = async (accessPolicy, models, criteria) => {
  const dbConditions = criteria;
  const accessibleCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );

  if (accessibleCountryCodes.length === 0) {
    throw new Error('Need Tupaia Admin Panel access');
  }

  accessibleCountryCodes.push('DL'); // If we have admin panel anywhere, we can also view Demo Land
  const entities = await models.entity.find({
    code: accessibleCountryCodes,
  });
  const entityIds = entities.map(e => e.id);
  dbConditions.entity_id = entityIds;

  return dbConditions;
};
