/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import {
  hasBESAdminAccess,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  LESMIS_ADMIN_PERMISSION_GROUP,
} from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertUserAccountPermissions = async (accessPolicy, models, userAccountId) => {
  const userAccount = await models.user.findById(userAccountId);
  if (!userAccount) {
    throw new Error(`No user account found with id ${userAccountId}`);
  }

  const entityPermissions = await models.userEntityPermission.find({ user_id: userAccount.id });
  const permissions = await models.permissionGroup.findManyById(
    entityPermissions.map(ep => ep.permission_group_id),
  );
  const permissionsById = keyBy(permissions, 'id');
  const entities = await models.entity.findManyById(entityPermissions.map(ep => ep.entity_id));
  const entitiesById = keyBy(entities, 'id');
  const countryCodes = entities.map(e => e.country_code).filter(c => c !== 'DL');
  if (countryCodes.length === 0) {
    // User only has access to Demo Land, and it got filtered out
    return true;
  }

  // Must have Admin Panel access to all countries the user has access to
  if (!accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error('Need Admin Panel access to all countries this user has access to');
  }
  // Must have equal or higher permissions than the user has for each permission they have
  entityPermissions.forEach(({ entity_id: entityId, permission_group_id: permissionGroupId }) => {
    const countryCode = entitiesById[entityId].country_code;
    const permissionGroup = permissionsById[permissionGroupId].name;
    if (!accessPolicy.allows(countryCode, permissionGroup)) {
      throw new Error(`Need ${permissionGroup} access to ${countryCode}`);
    }
  });

  return true;
};

const buildUserAccountRawSqlFilter = accessPolicy => {
  const accessibleCountryCodes = [
    ...accessPolicy.getEntitiesAllowed(TUPAIA_ADMIN_PANEL_PERMISSION_GROUP),
    ...accessPolicy.getEntitiesAllowed(LESMIS_ADMIN_PERMISSION_GROUP),
  ];
  const permissionsByCountryCode = accessibleCountryCodes.reduce(
    (obj, countryCode) => ({
      ...obj,
      [countryCode]: accessPolicy.getPermissionGroups([countryCode]),
    }),
    {},
  );

  /**
   * Here we're building up an inner query to work out which user permissions exist that we don't
   * have access to. Once we know that, we just filter to find the users whose ids are not in that list
   */
  const sql = `
  user_account.id not in (
    -- Inner query to detect which user_ids we don't have permission for
    select uep.user_id from user_entity_permission uep 
    join entity e on uep.entity_id = e.id 
    join permission_group pg on uep.permission_group_id = pg.id 

    where uep.user_id is not null and 
    (
      -- Either we don't have access to a country they have access to
      e.code not in ${SqlQuery.record(accessibleCountryCodes)}

      -- Or we have access to it, but not with the level of permissions they do
${accessibleCountryCodes
  .map(countryCode => {
    return `      or (e.code = ? and pg.name not in ${SqlQuery.record(
      permissionsByCountryCode[countryCode],
    )})`;
  })
  .join('\n')}
    )
  )`;

  const parameters = [
    ...accessibleCountryCodes,
    ...accessibleCountryCodes
      .map(countryCode => [countryCode, ...permissionsByCountryCode[countryCode]])
      .flat(),
  ];
  return { sql, parameters };
};

export const createUserAccountDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  // If we don't have BES Admin access, add a filter to the SQL query
  const dbConditions = { ...criteria };
  dbConditions[RAW] = buildUserAccountRawSqlFilter(accessPolicy);

  return dbConditions;
};
