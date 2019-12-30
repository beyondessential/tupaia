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
    UPDATE "dashboardReport" SET "viewJson" = '{"name": "Basic Disaster Response Metrics", "type": "view", "viewType": "multiValueRow", "presentationOptions": {"rowHeader": {"name": "Indicators", "color": "#efeff0"}, "leftColumn": {"color": "#22c7fc", "header": "Normal"}, "rightColumn": {"color": "#db2222", "header": "Current"}}}' WHERE id = 'disaster_response_basic_indicators';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
