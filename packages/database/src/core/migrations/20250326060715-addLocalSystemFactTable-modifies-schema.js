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
    CREATE TABLE local_system_fact
    (
        id         VARCHAR(255) PRIMARY KEY,
        key        VARCHAR(255) NOT NULL,
        value      TEXT,
        CONSTRAINT local_system_fact_key_unique UNIQUE (key)
    );
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
