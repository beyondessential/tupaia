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
    UPDATE "entity" SET "code" = 'VE_' || "code", "id" = 'VE_' || "id"
    WHERE "type" = 'facility' AND "country_code" = 'VE';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "entity" SET "code" = SUBSTRING("code" from 4), "id" = SUBSTRING("id" from 4)
    WHERE "type" = 'facility' AND "country_code" = 'VE';
  `);
};

exports._meta = {
  version: 1,
};
