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

const newConfig = {
  max: 1,
  min: 1,
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = jsonb_set("presentationOptions",'{scaleBounds,right}','${JSON.stringify(
      newConfig,
    )}')
    where id like 'AU_FLUTRACKING_%'
    and "measureBuilderConfig" #>> '{measureBuilders,denominator,measureBuilderConfig,dataElementCodes,0}'
     like 'FWV%_004';
  `);
};

exports.down = function (db) {
  // No down migration. Up migration destroyed data
  return null;
};

exports._meta = {
  version: 1,
};
