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
  await db.runSql(`ALTER TABLE survey ALTER COLUMN code type varchar(30);`);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE survey ALTER COLUMN code type text;`);
};

exports._meta = {
  version: 1,
};
