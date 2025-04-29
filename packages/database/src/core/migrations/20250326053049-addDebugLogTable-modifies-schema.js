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
    CREATE SCHEMA log;
  `);

  await db.runSql(`
    CREATE TABLE log.debug_log
    (
      id    VARCHAR(255) PRIMARY KEY,
      type  VARCHAR(255) NOT NULL,
      info  JSONB NOT NULL
    );  
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
