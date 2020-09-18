/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const hasUserAccountPermissions = async (accessPolicy, models, userAccount) => {
  const entityPermissions = await models.userEntityPermission.find({ user_id: userAccount.id });
  const entities = await models.entity.findManyById(entityPermissions.map(ep => ep.entity_id));
  const countryCodes = entities.map(e => e.country_code).filter(c => c !== 'DL');
  if (countryCodes.length === 0) {
    // User only has access to Demo Land, and it got filtered out
    return true;
  }

  return accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
};

export const assertUserAccountPermissions = async (accessPolicy, models, userAccount) => {
  const hasPermission = await hasUserAccountPermissions(accessPolicy, models, userAccount);
  if (!hasPermission) {
    throw new Error('Need Admin Panel access to all countries this user has access to');
  }
  return true;
};

export const filterUserAccountsByPermissions = async (accessPolicy, userAccounts, models) => {
  if (accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP)) {
    return userAccounts;
  }
  const userIds = userAccounts.map(ua => ua.id);
  const entityPermissions = await models.userEntityPermission.find({ user_id: userIds });
  const entities = await models.entity.find({ id: entityPermissions.map(ep => ep.entity_id) });

  const entitiesById = keyBy(entities, 'id');

  // Clear out all permissions we do have
  const filteredEntityPermissions = entityPermissions.filter(entityPermission => {
    const entity = entitiesById[entityPermission.entity_id];
    if (entity.country_code === 'DL') {
      return false;
    }
    return !accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  });

  const entityPermissionsByUserId = keyBy(filteredEntityPermissions, 'user_id');

  const filteredUserAccounts = userAccounts.filter(userAccount => {
    // If user id still exists in the filtered list, we don't have
    // access to all countries from that user
    return !(userAccount.id in entityPermissionsByUserId);
  });

  return filteredUserAccounts;
};
