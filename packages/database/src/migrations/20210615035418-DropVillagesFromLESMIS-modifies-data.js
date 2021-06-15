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
  UPDATE entity_hierarchy
  SET canonical_types = array_remove(canonical_types, 'village')
  WHERE name = 'laos_schools'
  `);
};

exports.down = async function (db) {
  await db.runSql(`
  UPDATE entity_hierarchy
  SET canonical_types = array_append(canonical_types, 'village')
  WHERE name = 'laos_schools'
  `);
};

exports._meta = {
  version: 1,
};
