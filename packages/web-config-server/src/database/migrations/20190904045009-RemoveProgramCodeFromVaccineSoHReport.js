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
    SET "dataBuilderConfig" = '{"dataSource": {"type": "single", "codes": ["PREAGGREGATED_DOSES_375874bf", "PREAGGREGATED_DOSES_44ec84bf", "PREAGGREGATED_DOSES_7191781d", "PREAGGREGATED_DOSES_6fc9d81d", "PREAGGREGATED_DOSES_cd2d581d", "PREAGGREGATED_DOSES_4e6a681d", "PREAGGREGATED_DOSES_40a8681d", "PREAGGREGATED_DOSES_452a74bf"]}, "columnTitle": "Stock Count", "stripFromDataElementNames": "Preaggregated "}'
    WHERE "id" = 'Imms_FridgeVaccineCount';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
