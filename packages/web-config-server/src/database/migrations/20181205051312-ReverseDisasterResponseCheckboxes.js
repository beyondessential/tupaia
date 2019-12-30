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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{
      "labels": {"DP17": "Functional communication system", "DP18": "Functional means of transportation", "DP1A": "Facility currently operational", "DP67": "Bulk warehouse capacity", "DP71": "No displaced people in catchment area", "DP74A": "Building intact (no apparent damage)"},
      "specialCases": {"DP71": "complement", "DP74A": "complement"}
    }'
    WHERE id = '30';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
