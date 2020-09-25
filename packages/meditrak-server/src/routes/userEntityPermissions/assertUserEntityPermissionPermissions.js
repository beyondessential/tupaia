/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const assertUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermission,
) => {
  const results = await filterUserEntityPermissionsByPermissions(
    accessPolicy,
    [userEntityPermission],
    models,
  );
  if (results.length === 0) {
    throw new Error('Need Admin Panel access to the country this entity is in');
  }
  return true;
};

export const filterUserEntityPermissionsByPermissions = async (
  accessPolicy,
  userEntityPermissions,
  models,
) => {
  if (accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP)) {
    return userEntityPermissions;
  }

  const countryCodesByEntityId = await models.entity.getEntityCountryCodeById(
    userEntityPermissions.map(uep => uep.entity_id),
  );

  const filteredUserEntityPermissions = userEntityPermissions.filter(userEntityPermission => {
    return accessPolicy.allows(
      countryCodesByEntityId[userEntityPermission.entity_id],
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  });
  return filteredUserEntityPermissions;
};
