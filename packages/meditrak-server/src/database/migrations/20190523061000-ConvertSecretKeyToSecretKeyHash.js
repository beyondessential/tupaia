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
  return db.renameColumn('api_client', 'secret_key', 'secret_key_hash');
};

exports.down = function(db) {
  return db.renameColumn('api_client', 'secret_key_hash', 'secret_key');
};

exports._meta = {
  version: 1,
};
