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
  const defaultConf = {
    level: 'Facility',
  };
  return db.runSql(`
  ALTER TABLE "mapOverlay"
  ADD COLUMN "measureBuilderConfig" JSONB,
  ADD COLUMN "measureBuilder" VARCHAR;

-- add values to existing measures
UPDATE "mapOverlay"
  SET
    "measureBuilderConfig" = '${JSON.stringify(defaultConf)}',
    "measureBuilder" = 'valueForOrgGroup';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
