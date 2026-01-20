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

const TABLE_NAME = 'login_attempts';

exports.up = async function (db) {
  await db.runSql(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      key varchar(255) PRIMARY KEY,
      points integer NOT NULL DEFAULT 0,
      expire bigint
    )
  `,
  );
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE ${TABLE_NAME}`);
};

exports._meta = {
  version: 1,
};
