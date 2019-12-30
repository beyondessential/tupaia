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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"aggregationTypes": {"numerator": "FINAL_EACH_MONTH", "denominator": "MOST_RECENT"}}'
    WHERE "id" = 'ANZGITA_Inventory';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"aggregationTypes": {"numerator": "MOST_RECENT", "denominator": "MOST_RECENT"}}'
    WHERE "id" = 'Imms_VaccinatedSchools';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
