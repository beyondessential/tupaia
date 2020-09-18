/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const hasUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermission,
) => {
  const entity = await models.entity.findById(userEntityPermission.entity_id);
  return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
};

export const assertUserEntityPermissionPermissions = async (
  accessPolicy,
  models,
  userEntityPermission,
) => {
  const hasPermission = await hasUserEntityPermissionPermissions(
    accessPolicy,
    models,
    userEntityPermission,
  );
  if (!hasPermission) {
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

  const entities = await models.entity.findManyById(userEntityPermissions.map(ar => ar.entity_id));
  const entitiesById = keyBy(entities, 'id');

  const filteredUserEntityPermissions = userEntityPermissions.filter(userEntityPermission => {
    const entity = entitiesById[userEntityPermission.entity_id];
    return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  });
  return filteredUserEntityPermissions;
};
