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
        'TO_HPU_Validation_HP_08',
        'tableFromDataElementGroups',
        '{
          "stripFromRowNames": ".*- ",
          "stripFromColumnNames": ".*- ",
          "rowDataElementGroupSets": [
            "HP_08_Total_One_on_One_Age_Counts",
            "HP_08_New_One_on_One_Age_Counts",
            "HP_08_Completed_One_on_One_Age_Counts",
            "HP_08_Dropout_One_on_One_Age_Counts",
            "HP_08_Total_Group_Age_Counts",
            "HP_08_New_Group_Age_Counts",
            "HP_08_Completed_Group_Age_Counts",
            "HP_08_Dropout_Group_Age_Counts"
          ],
          "columnDataElementGroupSets": ["HP_08_Gender_Counts"]
        }',
        '{
          "name": "Monthly Nutrition Counselling",
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
      "dashboardReports" = "dashboardReports" || '{ TO_HPU_Validation_HP_08 }'
    WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'TO_HPU_Validation_HP_08';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_HPU_Validation_HP_08')
    WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports._meta = {
  version: 1,
};
