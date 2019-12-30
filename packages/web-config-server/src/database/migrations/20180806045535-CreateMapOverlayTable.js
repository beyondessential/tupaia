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
  return db.createTable('mapOverlay', {
    columns: {
      id: { type: 'serial', notNull: true },
      name: { type: 'text', notNull: true },
      groupName: { type: 'text', notNull: true },
      userGroup: { type: 'text', notNull: true },
      dataElementCode: { type: 'text', notNull: true },
      displayType: { type: 'text' },
      customColors: { type: 'text' },
    },
    ifNotExists: true,
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
