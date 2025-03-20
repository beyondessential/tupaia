'use strict';

import { insertObject } from '../utilities';

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

const PROVINCIAL_DASHBOARD_GROUP = {
  organisationLevel: 'District',
  userGroup: 'Tonga Health Promotion Unit',
  organisationUnitCode: 'TO',
  dashboardReports: '{}',
  name: 'Health Promotion Unit',
  code: 'TO_Health_Promotion_Unit_District',
  projectCodes: '{fanafana,explore}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', PROVINCIAL_DASHBOARD_GROUP);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE code = '${PROVINCIAL_DASHBOARD_GROUP.code}';
  `);
};

exports._meta = {
  version: 1,
};
