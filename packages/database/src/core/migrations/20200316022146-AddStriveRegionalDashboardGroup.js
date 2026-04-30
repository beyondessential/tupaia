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
  return db.runSql(
    `INSERT INTO "dashboardGroup" (
    "organisationLevel",
    "userGroup",
    "organisationUnitCode",
    "name",
    "code"
    )
    VALUES (
    'Province',
    'STRIVE User',
    'PG',
    'STRIVE PNG',
    'PG_Strive_PNG_Province'
    );`,
  );
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" WHERE "code" = 'PG_Strive_PNG_Province';
  `);
};

exports._meta = {
  version: 1,
};
