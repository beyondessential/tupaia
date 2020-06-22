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
    UPDATE "clinic"
    SET
      "type" = 5.1,
      "category_code" = 5
    WHERE "type_name" = 'Storage';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "clinic"
    SET
      "type" = 1.1,
      "category_code" = 1
    WHERE "type_name" = 'Storage';
  `);
};

exports._meta = {
  version: 1,
};
