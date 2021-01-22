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
  return db.createTable('dhis_org_unit_mapping', {
    columns: {
      id: { type: 'text', primaryKey: true },
      code: { type: 'text', notNull: true, unique: true },
      dhis_id: { type: 'text', notNull: true },
    },
  });
};

exports.down = function (db) {
  return db.dropTable('dhis_org_unit_mapping');
};

exports._meta = {
  version: 1,
};
