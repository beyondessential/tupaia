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
      SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataElementCodes}', ("dataBuilderConfig"->'dataElementCodes')::jsonb || '["PREAGGREGATED_QTY_5e0d74bf"]')
      WHERE id = 'Imms_Stockouts';

    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataSource,codes}', ("dataBuilderConfig"->'dataSource'->'codes')::jsonb || '["PREAGGREGATED_DOSES_5e0d74bf"]')
      WHERE id = 'Imms_FridgeVaccineCount';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataElementCodes}', ("dataBuilderConfig"->'dataElementCodes')::jsonb - 'PREAGGREGATED_QTY_5e0d74bf')
      WHERE id = 'Imms_Stockouts';

    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataSource,codes}', ("dataBuilderConfig"->'dataSource'->'codes')::jsonb - 'PREAGGREGATED_DOSES_5e0d74bf')
      WHERE id = 'Imms_FridgeVaccineCount';
  `);
};

exports._meta = {
  version: 1,
};
