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
  return db.runSql(`
  INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson") VALUES (
    'UNFPA_RH_Stock_Cards_metrics',
    'sumLatestPerMetric',
    '{"dataElementCodes": ["RHS6UNFPA1210","RHS6UNFPA1223","RHS6UNFPA1236","RHS6UNFPA1249","RHS6UNFPA1262","RHS6UNFPA1301"]}',
    '{"name": "RH Stock Card", "type": "view", "viewType": "multiValue", "valueType": "boolean"}'
    );

  
    `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
