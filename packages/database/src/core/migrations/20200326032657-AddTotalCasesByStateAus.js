'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT_ID = 'COVID_Total_Cases_By_State';
const DASHBOARD_GROUP = 'AU_Covid_Country';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
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
        ],
        "aggregationType": "SUM"
      }',
      '{
        "name": "COVID-19 Total Confirmed Cases by State",
        "type": "chart",
        "chartType": "bar"
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
