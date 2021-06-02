'use strict';

import { insertObject } from '../utilities/migration';
import { generateId, arrayToDoubleQuotedDbString } from '../utilities';

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
      concat("organisationUnitCode", '_', REPLACE(name, ' ', '_'), '_', REPLACE((array_agg(distinct "userGroup"))[1], ' ', '_')) as code
    FROM "dashboardGroup"
    WHERE 'laos_schools' = ANY("projectCodes")
    GROUP BY name, "organisationUnitCode";
  `);
  await deleteArrayCatAgg(db);

  // Array types need to be formated specifically for insertObject
  for (const currentDashboard of dashboards.rows) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      ...currentDashboard,
      entity_types: `{${arrayToDoubleQuotedDbString(currentDashboard.entity_types)}}`,
      project_codes: `{${arrayToDoubleQuotedDbString(currentDashboard.project_codes)}}`,
    });
  }
};

const createLegacyDashboardItems = async db => {
  const dashboardReports = await db.runSql(`
    SELECT * from "dashboardReport"
    WHERE id IN
      (SELECT unnest("dashboardReports") from "dashboardGroup"
       WHERE 'laos_schools' = ANY("projectCodes"));
  `);

  for (const currentReport of dashboardReports.rows) {
    const { id: code, viewJson: config, ...legacyObject } = currentReport;
    const legacyId = generateId();
    const permissionGroups = await db.runSql(`
      SELECT array_agg(DISTINCT "userGroup") as permission_groups
      FROM "dashboardGroup"
      WHERE '${code}' = ANY("dashboardReports");
    `);
    await db.runSql(`
      -- Drop trigger because this change notification can blow out the size limit on pg_notify
      DROP TRIGGER IF EXISTS legacy_report_trigger
      ON legacy_report;

      INSERT INTO legacy_report
      VALUES ('${legacyId}',
              '${code}',
              '${currentReport.dataBuilder}',
              '${JSON.stringify(currentReport.dataBuilderConfig)}',
              '${JSON.stringify(currentReport.dataServices)}'
      );

      -- Recreate triggers
      CREATE TRIGGER legacy_report_trigger
        AFTER INSERT OR UPDATE or DELETE
        ON legacy_report
        FOR EACH ROW EXECUTE PROCEDURE notification();
    `);
    await db.runSql(`
      INSERT INTO dashboard_item
      VALUES (
        '${generateId()}',
        '${code}',
        '${JSON.stringify(config).replace(/'/g, "''")}',
        '{${permissionGroups.rows[0].permission_groups}}',
        '${code}',
         ${true}
      )
    `);
  }
};

const createDashboardRelationsFromDashboardGroups = async db => {
  const dashboardRelations = await db.runSql(`
    SELECT
      dashboard.id AS dashboard_id,
      unnest("dashboardReports") AS child_id
    FROM "dashboardGroup"
    INNER JOIN dashboard
      ON dashboard.name = "dashboardGroup".name
    WHERE 'laos_schools' = ANY("projectCodes")
    GROUP BY dashboard.id, child_id;
  `);

  for (const currentDashboardRelation of dashboardRelations.rows) {
    const childId = await db.runSql(`
      SELECT id FROM dashboard_item
      WHERE code = '${currentDashboardRelation.child_id}'
    `);
    await insertObject(db, 'dashboard_relation', {
      id: generateId(),
      ...currentDashboardRelation,
      child_id: childId.rows[0].id,
    });
  }
};

exports.up = async function (db) {
  await createDashboardsFromDashboardGroups(db);
  await createLegacyDashboardItems(db);
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
  await db.runSql(`
    DELETE FROM dashboard_item
    WHERE NOT EXISTS (
      SELECT * FROM dashboard_relation
      WHERE dashboard_relation.id = dashboard_item.id
    )
  `);
  await db.runSql(`
    -- Drop trigger because this change notification can blow out the size limit on pg_notify
    DROP TRIGGER IF EXISTS legacy_report_trigger
      ON legacy_report;

    DELETE FROM legacy_report
    WHERE NOT EXISTS (
      SELECT * FROM dashboard_item
      WHERE dashboard_item.report_code = legacy_report.id
    );

    -- Recreate triggers
    CREATE TRIGGER legacy_report_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON legacy_report
      FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports._meta = {
  version: 1,
};
