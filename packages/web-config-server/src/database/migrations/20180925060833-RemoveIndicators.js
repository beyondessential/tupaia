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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementCodes": [ "BCD25", "BCD31", "BCD32" ]}'
    WHERE id = '27';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementCodes": [ "DP1A", "DP17", "DP18", "DP67", "DP71", "DP74A" ]}'
    WHERE id = '30';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementCodes": [ "BCD39", "BCD41", "BCD43", "FF7", "BCD46", "BCD47", "BCD48", "BCD48a", "BCD48b", "BCD49", "BCD50", "BCD51", "BCD52", "BCD53", "BCD54", "BCD55" ]}'
    WHERE id = '22';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataElementCodes": [ "BCD46", "BCD47", "BCD48", "BCD48a", "BCD48b", "BCD49", "BCD50", "BCD51", "BCD52", "BCD53", "BCD54", "BCD55" ]}'
    WHERE id = '8';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
