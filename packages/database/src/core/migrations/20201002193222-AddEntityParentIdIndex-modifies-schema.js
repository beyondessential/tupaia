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
  return db.addIndex('entity', 'entity_parent_id_key', ['parent_id']);
};

exports.down = function (db) {
  return db.removeIndex('entity', 'entity_parent_id_key');
};

exports._meta = {
  version: 1,
};
