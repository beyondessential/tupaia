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
    UPDATE "entity"
      SET "parent_code" = 'CI'
      WHERE "code" = 'CI_Belier_Yamoussoukro';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "entity"
      SET "parent_code" = 'CI_Belier'
      WHERE "code" = 'CI_Belier_Yamoussoukro';
  `);
};

exports._meta = {
  version: 1,
};
