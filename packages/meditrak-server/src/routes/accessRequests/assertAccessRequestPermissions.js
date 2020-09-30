/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions/constants';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequest) => {
  const entity = await models.entity.findById(accessRequest.entity_id);
  if (!accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }
  return true;
};
