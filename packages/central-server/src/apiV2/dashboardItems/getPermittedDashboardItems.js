/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('@tupaia/database').ModelRegistry} ModelRegistry
 * @typedef {import('@tupaia/types').DashboardItem} DashboardItem
 */

import { SqlQuery } from '@tupaia/database';

/**
 * @param {AccessPolicy} accessPolicy
 * @param {ModelRegistry} models
 * @returns {Promise<DashboardItem['id'][]>}
 */
export const getPermittedDashboardItems = async (accessPolicy, models) => {
  const pgNames = accessPolicy.getPermissionGroups();
  if (pgNames.length === 0) return [];

  const rows = await models.database.executeSql(
    `
      SELECT DISTINCT
        di.id
      FROM
        dashboard_item di
        CROSS JOIN LATERAL unnest(coalesce(di.permission_group_ids, ARRAY[]::text[])) AS pg_id
        JOIN permission_group pg ON pg.id = pg_id
      WHERE
        pg.name IN ${SqlQuery.record(pgNames)}
     `,
    pgNames,
  );

  return rows.map(row => row.id);
};
