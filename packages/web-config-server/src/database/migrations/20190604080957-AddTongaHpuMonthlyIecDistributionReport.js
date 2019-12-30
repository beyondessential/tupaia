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
    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES
      (
        'TO_HPU_Validation_HP_05',
        'tableOfEvents',
        '{
          "stripFromColumnNames": "(HP05 IEC Distribution: )|(HP05 IEC Donor Type: )",
          "columns": {
            "HP238": {},
            "HP239": {},
            "HP240": {
              "additionalData": ["HP241"]
            },
            "HP242": {
              "additionalData": ["HP243"]
            },
            "HP244": {},
            "HP247": {},
            "HP248": {},
            "HP249": {},
            "HP250": {
              "additionalData": ["HP251"]
            }
          },
          "programCode": "HP05"
        }',
        '{
          "name" : "Monthly IEC Distribution",
          "type" : "chart",
          "chartType" : "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "one_month_at_a_time"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ TO_HPU_Validation_HP_05 }'
      WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'TO_HPU_Validation_HP_05';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_HPU_Validation_HP_05')
    WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports._meta = {
  version: 1,
};
