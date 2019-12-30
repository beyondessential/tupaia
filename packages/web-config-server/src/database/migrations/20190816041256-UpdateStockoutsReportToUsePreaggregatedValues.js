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
    SET "dataBuilderConfig" = '{"dataElementCodes": ["PREAGGREGATED_QTY_375874bf", "PREAGGREGATED_QTY_44ec84bf", "PREAGGREGATED_QTY_7191781d", "PREAGGREGATED_QTY_6fc9d81d", "PREAGGREGATED_QTY_cd2d581d", "PREAGGREGATED_QTY_4e6a681d", "PREAGGREGATED_QTY_40a8681d", "PREAGGREGATED_QTY_452a74bf"], "stripFromDataElementNames": "Preaggregated Quantity of "}'
    WHERE "id" = 'Imms_Stockouts';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
