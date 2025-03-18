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

const dashboardReportIds = `(
  'UNFPA_Monthly_3_Methods_of_Contraception',
  'UNFPA_Facilities_Offering_Delivery',
  'UNFPA_Monthly_5_Methods_of_Contraception',
  'UNFPA_Facilities_Offering_Services'
  )`;

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{periodType}', '"quarter"'),
      "viewJson" = jsonb_set("viewJson", '{periodGranularity}', '"quarter"')
    WHERE "id" IN ${dashboardReportIds};
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{periodType}', '"month"'),
      "viewJson" = jsonb_set("viewJson", '{periodGranularity}', '"month"')
    WHERE "id" IN ${dashboardReportIds};
  `);
};

exports._meta = {
  version: 1,
};
