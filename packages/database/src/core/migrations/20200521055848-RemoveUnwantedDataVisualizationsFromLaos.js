'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const REMOVABLE_MAP_OVERLAY_GROUP_NAMES = [
  'Cold Chain/Immunisation',
  'Disaster response',
  'Electricity',
  'Facility equipment',
  'Laboratory and diagnosis',
  'Medicines & Consumables',
  'Services provided',
  'Water and Sanitation',
];

const NUMBER_OF_OPERATIONAL_FACILITIES_REPORT_ID = '23';

const insertDashboardGroupToLaos = async (db, dashboardGroupName) => {
  // Fiji and Laos have the same country structure
  const { rows: dashboardGroups } = await db.runSql(
    `SELECT * from "dashboardGroup" WHERE name = '${dashboardGroupName}' AND "organisationUnitCode" = 'FJ'`,
  );

  // Clear existing dashboard groups for Laos before re-inserting them
  await db.runSql(
    `DELETE FROM "dashboardGroup" WHERE name = '${dashboardGroupName}' AND "organisationUnitCode" = 'LA'`,
  );
  await Promise.all(
    dashboardGroups.map(({ id, ...dashboardGroup }) => {
      insertObject(db, 'dashboardGroup', {
        ...dashboardGroup,
        dashboardReports: `{${dashboardGroup.dashboardReports}}`,
        organisationUnitCode: 'LA',
        code: `LA_${dashboardGroup.code.substr(2)}`,
      });
    }),
  );
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = array_remove("countryCodes", 'LA')
    WHERE
      "groupName" IN (${arrayToDbString(REMOVABLE_MAP_OVERLAY_GROUP_NAMES)});
  `);

  // `Oxygen concentrators` belongs to the removable `Facility equipment` overlay group,
  // but is still relevant to Laos
  await db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = "countryCodes" || '{LA}'
    WHERE
      name = 'Oxygen concentrators';
  `);
  // `Operational facilities` belongs to the removable `Services provided` overlay group,
  // but is still relevant to Laos
  await db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = "countryCodes" || '{LA}'
    WHERE
      name = 'Operational facilities';
  `);

  await db.runSql(`
    DELETE FROM "dashboardGroup" WHERE name = 'Raw Data Downloads' AND "organisationUnitCode" = 'LA';
    DELETE FROM "dashboardGroup" WHERE name = 'Clinical' AND "organisationUnitCode" = 'LA';
  `);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = '{${NUMBER_OF_OPERATIONAL_FACILITIES_REPORT_ID}}'
    WHERE
      name = 'General' AND "organisationUnitCode" = 'LA';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = "countryCodes" || '{LA}'
    WHERE
      "groupName" IN (${arrayToDbString(REMOVABLE_MAP_OVERLAY_GROUP_NAMES)});
  `);

  await insertDashboardGroupToLaos(db, 'Raw Data Downloads');
  await insertDashboardGroupToLaos(db, 'Clinical');
  await insertDashboardGroupToLaos(db, 'General');
};

exports._meta = {
  version: 1,
};
