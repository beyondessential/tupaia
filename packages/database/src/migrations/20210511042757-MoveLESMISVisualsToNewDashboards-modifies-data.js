'use strict';

import { insertObject } from '../utilities/migration';
import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const createArrayCatAgg = async db => {
  return db.runSql(`
    CREATE AGGREGATE array_cat_agg(anyarray) (
      SFUNC=array_cat,
      STYPE=anyarray
    );
  `);
};
const deleteArrayCatAgg = async db => {
  return db.runSql(`
    DROP AGGREGATE array_cat_agg(anyarray)
  `);
};

const createDashboardsFromDashboardGroups = async db => {
  await createArrayCatAgg(db);
  const dashboards = await db.runSql(`
    SELECT
      name,
      "organisationUnitCode" AS root_entity_code,
      array_agg(CASE "organisationLevel"
                WHEN 'SubDistrict'
                  THEN 'sub_district'
                  ELSE LOWER("organisationLevel")
                END) AS entity_types,
      array_cat_agg(distinct "projectCodes") AS project_codes,
      array_agg(distinct "userGroup") AS base_permission_groups,
      concat("organisationUnitCode", '_', REPLACE(name, ' ', '_'), '_', REPLACE((array_agg(distinct "userGroup"))[1], ' ', '_')) as code
    FROM "dashboardGroup"
    WHERE 'laos_schools' = ANY("projectCodes")
    GROUP BY name, "organisationUnitCode";
  `);
  await deleteArrayCatAgg(db);

  for (const currentDashboard of dashboards.rows) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      ...currentDashboard,
    });
  }
};

const createDashboardRelationsFromDashboardGroups = async db => {
  const dashboardRelations = await db.runSql(`
    SELECT
      dashboard.id AS dashboard_id,
      unnest("dashboardReports") AS child_id,
      'dashboardReport' AS child_type
    FROM "dashboardGroup"
    INNER JOIN dashboard
      ON dashboard.name = "dashboardGroup".name
    WHERE 'laos_schools' = ANY("projectCodes");
  `);

  for (const currentDashboardRelation of dashboardRelations.rows) {
    await insertObject(db, 'dashboard_relation', {
      id: generateId(),
      ...currentDashboardRelation,
    });
  }
};

exports.up = async function (db) {
  await createDashboardsFromDashboardGroups(db);
  await createDashboardRelationsFromDashboardGroups(db);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM dashboard_relation
    WHERE dashboard_id IN (SELECT id FROM dashboard WHERE 'laos_schools' = ANY(project_codes))
  `);
  await db.runSql(`
    DELETE FROM dashboard
    WHERE 'laos_schools' = ANY(project_codes)
  `);
};

exports._meta = {
  version: 1,
};
