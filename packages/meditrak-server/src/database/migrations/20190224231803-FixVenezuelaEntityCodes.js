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
    UPDATE "clinic" SET "code" = 'VE_' || "code"
    WHERE "country_id" IN (SELECT "id" FROM "country" WHERE "code" = 'VE');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "clinic" SET "code" = SUBSTRING("code" from 4)
    WHERE "code" LIKE 'VE_%';
  `);
};

exports._meta = {
  version: 1,
};
