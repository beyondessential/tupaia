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

const REPORT_ID = 'TO_HPU_Validation_HP_06';

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES
      (
        '${REPORT_ID}',
        'tableFromDataElementGroups',
        '{
          "stripFromRowNames": ".*- ",
          "stripFromColumnNames": ".*- ",
          "rowDataElementGroupSets": [
            "HP06_Section_1_Total_Restricted_Areas_Inspected",
            "HP06_Section_2_Number_of_Areas_Non_Compliant",
            "HP06_Section_3_Spot_Warning",
            "HP06_Section_4_Spot_Fine",
            "HP06_Section_5_Miscellaneous"
          ],
          "columnDataElementGroupSets": ["HP06_Column_Number"],
          "shouldShowTotalsRow": true
        }',
        '{
          "name": "Monthly Tobacco Enforcement",
          "type": "chart",
          "chartType": "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "one_month_at_a_time"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport"
      WHERE "id" = '${REPORT_ID}';
    UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}');
  `);
};

exports._meta = {
  version: 1,
};
