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

exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE "mapOverlay"
      ADD COLUMN report_code TEXT,
      ADD COLUMN legacy BOOLEAN NOT NULL DEFAULT 'true'`);
  // Fill the existing entries with legacy = true, then swap out the default
  await db.runSql(`
    ALTER TABLE "mapOverlay"
      ALTER COLUMN legacy SET DEFAULT 'false'`);
};

exports.down = async function (db) {
  return db.runSql(`
    ALTER TABLE "mapOverlay"
      DROP COLUMN legacy,
      DROP COLUMN report_code`);
};

exports._meta = {
  version: 1,
};
