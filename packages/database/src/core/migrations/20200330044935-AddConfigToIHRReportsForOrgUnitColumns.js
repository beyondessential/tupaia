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
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"columnType": "$orgUnit"}'
    WHERE "id" IN ('WHO_IHR_SPAR_NST', 'WHO_IHR_SPAR_WPRO', 'WHO_IHR_JEE_WPRO');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
