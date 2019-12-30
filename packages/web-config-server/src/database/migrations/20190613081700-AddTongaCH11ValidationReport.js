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

const REPORT_ID = 'TO_CH_Validation_CH_11';
const BASE_REPORT_NAME = 'Monthly NCD Risk Factors - Scheduled Population Screening';
const PERIOD_GRANULARITY = 'one_month_at_a_time';
const DASHBOARD_REPORT_GROUPS =
  "('TO_Community_Health_Validation', 'DL_Community_Health_Validation')";

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES
      (
        '${REPORT_ID}',
        'tableOfEvents',
        '{
          "stripFromColumnNames": "CH11 ",
          "columns": {
            "CH451": {}
          },
          "programCode": "CH11"
        }',
        '{
          "name" : "${BASE_REPORT_NAME}",
          "type" : "chart",
          "chartType" : "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "${PERIOD_GRANULARITY}"
        }',
        '[{ "isDataRegional": false }]'
      );

    INSERT INTO
      "dashboardReport" ("id", "drillDownLevel", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES
      (
        '${REPORT_ID}',
        1,
        'tableFromDataElementGroups',
        '{
          "stripFromRowNames": "CH11 ",
          "stripFromColumnNames": "CH11 ",
          "shouldShowTotalsColumn": true,
          "rowDataElementGroupSets": ["CH11_Rows"],
          "columnDataElementGroupSets": ["CH11_Columns"]
        }',
        '{
          "name": "${BASE_REPORT_NAME} - Details",
          "type": "chart",
          "chartType": "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "${PERIOD_GRANULARITY}"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{"drillDown": {"keyLink": "eventId", "parameterLink": "eventId"}}'
    WHERE
      id = '${REPORT_ID}' AND "drillDownLevel" IS NULL;

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
