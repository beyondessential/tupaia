'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const COUNTRIES_WITH_WORLD_DASHBOARDS = [
  'CK',
  'FJ',
  'KI',
  'LA',
  'PG',
  'PH',
  'WS',
  'SB',
  'TL',
  'TK',
  'TO',
  'VU',
  'VE',
];

const addDashboardGroupsToCountry = (db, dashboardGroups, countryCode) =>
  Promise.all(
    // dashboardGroups.map(({ id, dashboardReports, ...dashboardGroup }) => {
    dashboardGroups.map(dashboardGroup => {
      const { organisationLevel, userGroup, dashboardReports, name } = dashboardGroup;

      return db.runSql(`
        INSERT INTO "dashboardGroup" (
          "organisationLevel",
          "userGroup",
          "organisationUnitCode",
          "dashboardReports",
          "name",
          "code"
        )
        VALUES (
          '${organisationLevel}',
          '${userGroup}',
          '${countryCode}',
          '{${dashboardReports}}',     
          '${name}',
          '${[countryCode, name, organisationLevel, userGroup].join('_')}'
        )`);
    }),
  );

// 'DL' already has a country specific General dashboard
const updateDemoLandCodes = async db =>
  db.runSql(
    `UPDATE
      "dashboardGroup"
    SET
      code = concat('DL_General_', dg."organisationLevel", '_', dg."userGroup")
    FROM
      "dashboardGroup" dg
    WHERE
      "dashboardGroup".id = dg.id AND dg.name = 'General' AND dg."organisationUnitCode" = 'DL';`,
  );

const hasWorldDashboard = `"organisationLevel" <> 'World' AND "organisationUnitCode" = 'World'`;

exports.up = async function(db) {
  const { rows: dashboardGroups } = await db.runSql(
    `SELECT * from "dashboardGroup" WHERE ${hasWorldDashboard};`,
  );

  await db.runSql(`DELETE FROM "dashboardGroup" WHERE ${hasWorldDashboard};`);
  await Promise.all(
    COUNTRIES_WITH_WORLD_DASHBOARDS.map(countryCode =>
      addDashboardGroupsToCountry(db, dashboardGroups, countryCode),
    ),
  );
  // For consistency with the other country specific General dashboards
  await updateDemoLandCodes(db);
};

exports.down = async function(db) {
  const countryToKeep = COUNTRIES_WITH_WORLD_DASHBOARDS[0];
  const countriesToDelete = COUNTRIES_WITH_WORLD_DASHBOARDS.slice(1);

  await db.runSql(`UPDATE "dashboardGroup" SET "code" = NULL WHERE ${hasWorldDashboard};`);
  await db.runSql(
    `DELETE FROM "dashboardGroup" WHERE  "organisationLevel" <> 'World' AND "organisationUnitCode" IN (${arrayToDbString(
      countriesToDelete,
    )});`,
  );
  await db.runSql(
    `UPDATE
      "dashboardGroup"
    SET
      "organisationUnitCode" = 'World',
      code = NULL
    WHERE
      "organisationLevel" <> 'World' AND "organisationUnitCode" = '${countryToKeep}';`,
  );
};

exports._meta = {
  version: 1,
};
