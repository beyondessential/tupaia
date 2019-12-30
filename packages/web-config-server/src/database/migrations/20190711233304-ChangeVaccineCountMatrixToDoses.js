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
  SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataSource, codes}', '["DOSES_375874bf","DOSES_44ec84bf","DOSES_7191781d","DOSES_6fc9d81d","DOSES_cd2d581d","DOSES_4e6a681d","DOSES_40a8681d","DOSES_452a74bf"]')
  WHERE id = 'Imms_FridgeVaccineCount';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
