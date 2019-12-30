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
  return db.createTable('dashboardGroup', {
    columns: {
      id: { type: 'serial', primaryKey: true },
      organisationLevel: { type: 'text', notNull: true },
      userGroup: { type: 'text', notNull: true },
      organisationUnitCode: { type: 'text', notNull: true },
      dashboardReports: { type: 'text[]', notNull: true, defaultValue: '{}' },
      name: { type: 'text', notNull: true },
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
