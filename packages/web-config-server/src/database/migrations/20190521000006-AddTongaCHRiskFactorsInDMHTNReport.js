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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES ('TO_CH_Descriptive_RiskFactors', 'sumLatestData', '{"dataElementCodes": ["CH287", "CH288", "CH289", "CH290", "CH291", "CH292", "CH293", "CH294", "CH295", "CH296", "CH297"]}', '{"name": "Risk Factors in DM and HTN Cases", "type": "chart", "chartType": "bar", "yName": "Number of Cases"}');

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{TO_CH_Descriptive_RiskFactors}'
    WHERE "code" IN ('Tonga_Community_Health_Country', 'Tonga_Community_Health_District');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
