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

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" - 'filter' || jsonb_build_object('customFilter', "dataBuilderConfig"->'filter')
    WHERE "dataBuilder" = 'percentagesOfValueCountsPerPeriod'
    AND "dataBuilderConfig" ? 'filter';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" - 'customFilter' || jsonb_build_object('filter', "dataBuilderConfig"->'customFilter')
    WHERE "dataBuilder" = 'percentagesOfValueCountsPerPeriod'
    AND "dataBuilderConfig" ? 'customFilter';
  `);
};

exports._meta = {
  version: 1,
};
