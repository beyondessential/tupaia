'use strict';

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

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code", "viewMode")
      SELECT "organisationLevel", 'EPI', 'SB', "dashboardReports", "name", REPLACE("code", 'VU', 'SB'), "viewMode"
        FROM "dashboardGroup"
        WHERE "code" LIKE 'VU_Imms_%';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup"
      WHERE "code" LIKE 'SB_Imms_%';
  `);
};

exports._meta = {
  version: 1,
};
