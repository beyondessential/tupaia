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

const REPORT_ID = 'Imms_FridgeBreaches';
const BASE_REPORT_NAME = 'Fridge Temperature Breaches';
const PERIOD_GRANULARITY = 'one_month_at_a_time';
const DASHBOARD_REPORT_GROUPS = "('VU_Imms_Country', 'VU_Imms_Province', 'VU_Imms_Facility')";

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES
      (
        '${REPORT_ID}',
        'fridgeBreaches',
        '{
          "columns": {
            "BREACH_TEMP": {},
            "BREACH_MINS": {},
            "BREACH_SOH_VALUE": {}
          },
          "programCode": "FRIDGE_BREACH_PREAGGREGATED"
        }',
        '{
          "name" : "${BASE_REPORT_NAME}",
          "type" : "chart",
          "chartType" : "matrix",
          "periodGranularity": "${PERIOD_GRANULARITY}",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
        }',
        '[{ "isDataRegional": true }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" IN ${DASHBOARD_REPORT_GROUPS};
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = '${REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" IN ${DASHBOARD_REPORT_GROUPS};
  `);
};

exports._meta = {
  version: 1,
};
