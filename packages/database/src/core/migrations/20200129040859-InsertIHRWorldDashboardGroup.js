'use strict';

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

exports.up = function (db) {
  return db.runSql(`
    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name")
      VALUES (
        'World',
        'Public',
        'World',
        '{WHO_SURVEY}',
        'IHR Report'
      );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" WHERE "name" = 'IHR Report';
  `);
};

exports._meta = {
  version: 1,
};
