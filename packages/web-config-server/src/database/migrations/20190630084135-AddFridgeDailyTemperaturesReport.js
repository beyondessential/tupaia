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
    SET "dataBuilderConfig" = '{"series": [{"key": "Max", "dataElementCode": "FRIDGE_MAX_TEMP"}, {"key": "Min", "dataElementCode": "FRIDGE_MIN_TEMP"}], "programCode": "FRIDGE_DAILY"}',
        "viewJson" = '{"name": "Daily Fridge Temperatures", "type": "chart", "chartType": "line", "chartConfig": {"Min": {"color": "#2196f3"}, "Max": {"color":  "#f44336" }}, "periodGranularity": "day"}'
    WHERE "id" = 'Imms_FridgeDailyTemperatures';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{"Imms_FridgeDailyTemperatures"}'
    WHERE "code" = 'VU_Imms_Facility' AND "userGroup" = 'Vanuatu EPI';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
