'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders,denominator,measureBuilderConfig,dataElementCodes}', '["FWV_004"]')
    where id = 'AU_FLUTRACKING_Sought_Medical_Advice';

    update "mapOverlay"
    set
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders,denominator,measureBuilderConfig,dataElementCodes}', '["FWV_LGA_004"]')
    where id = 'AU_FLUTRACKING_LGA_Sought_Medical_Advice';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders,denominator,measureBuilderConfig,dataElementCodes}', '["FWV_003"]')
    where id = 'AU_FLUTRACKING_Sought_Medical_Advice';

    update "mapOverlay"
    set
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders,denominator,measureBuilderConfig,dataElementCodes}', '["FWV_LGA_003"]')
    where id = 'AU_FLUTRACKING_LGA_Sought_Medical_Advice';
  `);
};

exports._meta = {
  version: 1,
};
