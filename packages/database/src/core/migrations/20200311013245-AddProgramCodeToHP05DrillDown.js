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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"programCode": "HP05"}'
    WHERE "id" = 'TO_HPU_Validation_HP_05' AND "drillDownLevel" = 1;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" - 'programCode'
    WHERE "id" = 'TO_HPU_Validation_HP_05' AND "drillDownLevel" = 1;
  `);
};

exports._meta = {
  version: 1,
};
