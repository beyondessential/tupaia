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

const dashboardReportIds = `('11', '12')`;

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'period',
      "viewJson" = "viewJson" || '{"defaultTimePeriod":{"start":{"unit":"year","offset":-1}}}'
    WHERE "id" IN ${dashboardReportIds};
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" || '{"period":"LAST_12_MONTHS;THIS_MONTH"}',
      "viewJson" = "viewJson" - 'defaultTimePeriod'
    WHERE "id" IN ${dashboardReportIds};
  `);
};

exports._meta = {
  version: 1,
};
