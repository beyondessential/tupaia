/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions/constants';

export const assertUserAccountPermissions = async (accessPolicy, models, userAccount) => {
  const entityPermissions = await models.userEntityPermission.find({ user_id: userAccount.id });
  const entities = await models.entity.findManyById(entityPermissions.map(ep => ep.entity_id));
  const countryCodes = entities.map(e => e.country_code).filter(c => c !== 'DL');
  if (countryCodes.length === 0) {
    // User only has access to Demo Land, and it got filtered out
    return true;
  }
  if (!accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to all countries this user has access to');
  }
  return true;
};
