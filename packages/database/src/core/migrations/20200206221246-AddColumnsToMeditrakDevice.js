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
  await db.addColumn('meditrak_device', 'app_version', { type: 'text' });
  return db.addColumn('meditrak_device', 'config', { type: 'jsonb', defaultValue: '{}' });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
