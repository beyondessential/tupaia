'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT_ID = 'COVID_Cases_By_State';
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
          "AU_SA": "SA",
          "AU_WA": "WA",
          "AU_NSW": "NSW",
          "AU_QLD": "QLD",
          "AU_TAS": "TAS",
          "AU_VIC": "VIC"
        },
        "dataElementCodes": [
          "dailysurvey003"
        ]
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
