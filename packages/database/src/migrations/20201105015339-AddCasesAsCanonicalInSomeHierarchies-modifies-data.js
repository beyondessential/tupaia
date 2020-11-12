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
    UPDATE entity_hierarchy
    SET canonical_types = '{"country", "district", "sub_district", "village", "facility", "case"}'
    WHERE name IN ('strive', 'fanafana');
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE entity_hierarchy
    SET canonical_types = NULL
    WHERE name IN ('strive', 'fanafana');
  `);
};

exports._meta = {
  version: 1,
};
