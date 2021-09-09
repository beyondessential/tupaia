/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertUserAccountPermissions = async (accessPolicy, models, userAccountId) => {
  const userAccount = await models.user.findById(userAccountId);
  if (!userAccount) {
    throw new Error(`No user account found with id ${userAccountId}`);
  }

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

export const createUserAccountDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const dbConditions = { ...criteria };
  const accessibleCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  accessibleCountryCodes.push('DL'); // If we have admin panel anywhere, we can also view Demo Land
  const entities = await models.entity.find({
    code: accessibleCountryCodes,
  });
  const entityIds = entities.map(e => e.id);
  // Checks list of entity ids the user has access to is contained within the list of entity ids
  // the accessPolicy permits (plus Demo Land)
  dbConditions[RAW] = {
    sql: `array(select entity_id from user_entity_permission uep where uep.user_id = user_account.id) <@ array[${entityIds
      .map(() => '?')
      .join(',')}]`,
    parameters: entityIds,
  };
  return dbConditions;
};
