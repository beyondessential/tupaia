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
  db.addColumn('dashboardReport', 'dataSources', {
    type: 'jsonb',
    defaultValue: '[{ "isDataRegional": true }]',
  });
  db.runSql(`
    UPDATE "dashboardReport"
    SET "dataSources" = '[{ "isDataRegional": false }]'
    WHERE "isDataRegional" = FALSE;
  `);
  return db.removeColumn('dashboardReport', 'isDataRegional');
};

exports.down = function(db) {
  db.addColumn('dashboardReport', 'isDataRegional', { type: 'boolean', defaultValue: true });
  db.runSql(`
    UPDATE "dashboardReport"
    SET "isDataRegional" = FALSE
    WHERE "dataSources" = '[{ "isDataRegional": false }]';
  `);
  return db.removeColumn('dashboardReport', 'dataSources');
};

exports._meta = {
  version: 1,
};
