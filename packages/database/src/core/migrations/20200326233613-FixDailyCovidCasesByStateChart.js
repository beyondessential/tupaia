'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const OLD_REPORT_ID = 'COVID_Cases_By_State';
const REPORT_ID = 'COVID_New_Cases_By_State';
const DASHBOARD_GROUP = 'AU_Covid_Country';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    DELETE FROM 
      "dashboardReport"
    WHERE 
      id='${OLD_REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${OLD_REPORT_ID}')
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
      'sumByOrgUnit',
      '{
        "labels": {
          "AU_South Australia": "SA",
          "AU_Western Australia": "WA",
          "AU_New South Wales": "NSW",
          "AU_Queensland": "QLD",
          "AU_Tasmania": "TAS",
          "AU_Victoria": "VIC",
          "AU_Northern Territory": "NT",
          "AU_Australian Capital Territory": "ACT"
        },
        "dataElementCodes": [
          "dailysurvey003"
        ]
      }',
      '{
        "name": "COVID-19 New Confirmed Cases by State",
        "type": "chart",
        "chartType": "bar",
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
