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

const ID = 'SchDP_Partner_Assistance_Types';

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{entityAggregation,dataSourceEntityType}', '"country"')
    WHERE id = '${ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{entityAggregation,dataSourceEntityType}', '"school"')
    WHERE id = '${ID}';
  `);
};

exports._meta = {
  version: 1,
};
