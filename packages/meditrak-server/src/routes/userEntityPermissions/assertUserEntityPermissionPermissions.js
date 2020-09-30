/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions/constants';

export const assertUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermission,
) => {
  const entity = await models.entity.findById(userEntityPermission.entity_id);
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to the country this entity is in');
  }
  return true;
};
