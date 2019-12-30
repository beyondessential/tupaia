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
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementPairs": [["DP_NEW001", "DP_NEW003"]]}'
    WHERE "id" = 'Disaster_Response_Comparisons';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementPairs": [["DP9", "DP_NEW003"]]}'
    WHERE "id" = 'Disaster_Response_Comparisons';
  `);
};

exports._meta = {
  version: 1,
};
