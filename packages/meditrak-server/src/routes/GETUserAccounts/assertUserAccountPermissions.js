/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const assertUserAccountPermissions = async (accessPolicy, models, userAccount) => {
  const results = await filterUserAccountsByPermissions(accessPolicy, [userAccount], models);
  if (results.length === 0) {
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

  const countryCodesByEntityId = await models.entity.getEntityCountryCodeById(
    entityPermissions.map(ep => ep.entity_id),
  );

  // Clear out all permissions we do have
  const filteredEntityPermissions = entityPermissions.filter(entityPermission => {
    const countryCode = countryCodesByEntityId[entityPermission.entity_id];
    if (countryCode === 'DL') {
      return false;
    }
    return !accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  });

  const entityPermissionsByUserId = keyBy(filteredEntityPermissions, 'user_id');

  return userAccounts.filter(userAccount => {
    // If user id still exists in the filtered list, we don't have
    // access to all countries from that user
    return !(userAccount.id in entityPermissionsByUserId);
  });
};
