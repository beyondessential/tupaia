import keyBy from 'lodash.keyby';

import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const assertUserAccountPermissions = async (accessPolicy, models, userAccountId) => {
  const userAccount = ensure(
    await models.user.findById(userAccountId),
    `No user account exists with ID ${userAccountId}`,
  );

  const entityPermissions = await userAccount.getEntityPermissions();
  const permissions = await models.permissionGroup.findManyById(
    entityPermissions.map(ep => ep.permission_group_id),
  );
  const permissionsById = keyBy(permissions, 'id');
  const entities = await models.entity.findManyById(entityPermissions.map(ep => ep.entity_id));
  const entitiesById = keyBy(entities, 'id');
  const countryCodes = entities.map(e => e.country_code);
  if (countryCodes.length === 0) {
    // User has no permissions, so anyone can view/edit their account
    return true;
  }

  // Must have Admin Panel access to all countries the user has access to
  if (!accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new PermissionsError('Need Admin Panel access to all countries this user has access to');
  }
  // Must have equal or higher permissions than the user has for each permission they have
  entityPermissions.forEach(({ entity_id: entityId, permission_group_id: permissionGroupId }) => {
    const countryCode = entitiesById[entityId].country_code;
    const permissionGroup = permissionsById[permissionGroupId].name;
    if (!accessPolicy.allows(countryCode, permissionGroup)) {
      throw new PermissionsError(`Need ‘${permissionGroup}’ access to ${countryCode}`);
    }
  });

  return true;
};

const buildUserAccountRawSqlFilter = accessPolicy => {
  const accessibleCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  const permissionsByCountryCode = accessibleCountryCodes.reduce((obj, countryCode) => {
    obj[countryCode] = accessPolicy.getPermissionGroups([countryCode]);
    return obj;
  }, {});

  /**
   * Here we're building up an inner query to work out which user permissions exist that we don't
   * have access to. Once we know that, we just filter to find the users whose ids are not in that list
   *
   * eg. If my access policy is: { DL: ['Admin', 'Public'], TO: ['Donor'] }
   * The query is:
      user_account.id NOT IN (
        SELECT uep.user_id FROM user_entity_permission uep
        JOIN entity e ON uep.entity_id = e.id
        JOIN permission_group pg ON uep.permission_group_id = pg.id

        WHERE
          -- Either we don't have access to a country they have access to
          e.code NOT IN ('DL', 'TO')

          -- Or we have access to it, but not with the level of permissions they do
          OR (e.code = 'DL' AND pg.name NOT IN ('Admin', 'Public'))
          OR (e.code = 'TO' AND pg.name NOT IN ('Donor'))
      )
   */
  const sql = `
  user_account.id NOT IN (
    -- Inner query to detect which users have permissions that we do not
    SELECT uep.user_id FROM user_entity_permission uep
    JOIN entity e ON uep.entity_id = e.id
    JOIN permission_group pg ON uep.permission_group_id = pg.id

    WHERE
      -- Either we don't have access to a country they have access to
      e.code NOT IN ${SqlQuery.record(accessibleCountryCodes)}

      -- Or we have access to it, but not with the level of permissions they do
${accessibleCountryCodes
  .map(
    countryCode =>
      `      OR (e.code = ? AND pg.name NOT IN ${SqlQuery.record(
        permissionsByCountryCode[countryCode],
      )})`,
  )
  .join('\n')}
  )`;

  const parameters = [
    ...accessibleCountryCodes,
    ...accessibleCountryCodes.flatMap(countryCode => [
      countryCode,
      ...permissionsByCountryCode[countryCode],
    ]),
  ];
  return { sql, parameters };
};

export const createUserAccountDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  // If we don't have BES Admin access, add a filter to the SQL query
  const rawSqlFilter = buildUserAccountRawSqlFilter(accessPolicy, models);
  if (!criteria || Object.keys(criteria).length === 0) {
    // No given criteria, just return raw SQL
    return {
      [QUERY_CONJUNCTIONS.RAW]: rawSqlFilter,
    };
  }

  return {
    ...criteria,
    [QUERY_CONJUNCTIONS.AND]: {
      [QUERY_CONJUNCTIONS.RAW]: rawSqlFilter,
    },
  };
};
