'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT_ID = 'COVID_Daily_Cases_By_Type';
const DASHBOARD_GROUP = 'AU_Covid_Province';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  // First delete the old entry, then create a new one
  return db.runSql(`
    DELETE FROM 
      "dashboardReport"
    WHERE 
      id='${REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code"='${DASHBOARD_GROUP}';

    INSERT INTO "dashboardReport" (
      "id",
      "dataBuilder",
      "dataBuilderConfig",
      "viewJson"
      )
      VALUES (
      '${REPORT_ID}',
      'sumLatestPerMetric',
      '{"labels": {
          "dailysurvey003": "New confirmed cases today",
          "dailysurvey004": "New deaths today",
          "dailysurvey005": "New confirmed recoveries today"
        },
      "dataElementCodes": [
          "dailysurvey003",
          "dailysurvey004",
          "dailysurvey005"
        ]
      }',
      '{
        "name": "COVID-19 New Case Numbers",
        "type": "view",
        "viewType": "multiValue",
        "valueType": "text",
        "periodGranularity": "one_day_at_a_time"
      }'
      );
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code"='${DASHBOARD_GROUP}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  DELETE FROM 
    "dashboardReport"
  WHERE 
    id='${REPORT_ID}';

  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
  WHERE
    "code"='${DASHBOARD_GROUP}';
  `);
};

exports._meta = {
  version: 1,
};
