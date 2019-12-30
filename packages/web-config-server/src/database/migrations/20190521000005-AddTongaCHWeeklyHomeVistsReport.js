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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES ('TO_CH_Home_Visits', 'latestAchievedVsTargetPercentage', '{"targetDataElementCode": "CH336", "achievedDataElementCode": "CH337"}', '{"name": "Weekly Home Visits Completion", "type": "chart", "xName": "Week", "yName": "%", "barConfig": {"achieved": {"color": "#279A63", "label": "% Home Visits Complete", "stackId": "1"}, "remaining": {"color": "#EE4230", "label": "% Home Visits Not Complete", "stackId": "1"}}, "chartType": "bar", "valueType": "percentage", "periodGranularity": "one_week_at_a_time"}', '[{ "isDataRegional": false }]');

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{TO_CH_Home_Visits}'
    WHERE code = 'Tonga_Community_Health_District';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
