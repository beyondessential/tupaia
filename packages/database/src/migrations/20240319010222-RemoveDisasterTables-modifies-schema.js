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
  return db.runSql(`
    DROP TABLE IF EXISTS "disasterEvent";
    DROP TABLE IF EXISTS "disaster";
    DROP TYPE IF EXISTS disaster_type;
    DROP TYPE IF EXISTS disaster_event_type;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
