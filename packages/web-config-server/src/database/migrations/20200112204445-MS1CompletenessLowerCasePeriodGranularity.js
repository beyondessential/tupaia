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
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" || '{"periodGranularity":"month"}'
    WHERE "id" = 'MS1_COMPLETENESS';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" || '{"periodGranularity":"MONTH"}'
    WHERE "id" = 'MS1_COMPLETENESS';
  `);
};

exports._meta = {
  version: 1,
};
