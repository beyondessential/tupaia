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
  return db.addColumn('map_overlay', 'entity_attributes_filter', {
    type: 'jsonb',
    defaultValue: '{}',
    notNull: true,
  });
};

exports.down = function (db) {
  return db.removeColumn('map_overlay', 'entity_attributes_filter');
};

exports._meta = {
  version: 1,
};
