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
  UPDATE "country"
  SET "code" = 'NO'
  WHERE "id" = '59085f2dfc6a0715dae508f1';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  UPDATE "country"
  SET "code" = 'NC'
  WHERE "id" = '59085f2dfc6a0715dae508f1';
  `);
};

exports._meta = {
  version: 1,
};
