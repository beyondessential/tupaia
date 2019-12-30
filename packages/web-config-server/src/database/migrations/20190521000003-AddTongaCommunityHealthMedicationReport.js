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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig" ,"viewJson", "dataSources")
    VALUES ('TO_CH_Medication', 'sumLatestData', '{"dataElementCodes": ["CH267", "CH268", "CH269", "CH270", "CH271", "CH272", "CH273", "CH274", "CH275", "CH276", "CH277", "CH278", "CH279", "CH280", "CH281", "CH282", "CH283", "CH284"]}', '{"name": "Medication in DM and HTN Cases", "type": "chart", "chartType": "bar"}', '[{ "isDataRegional": false }]');

    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" ||'{TO_CH_Medication}' WHERE "code" IN ('Tonga_Community_Health_Country', 'Tonga_Community_Health_District');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
