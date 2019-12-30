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

const BASE_REPORT_ID = 'TO_HPU_Validation_HP_04';

exports.up = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{rowDataElementGroupSets}',
        '[
          "HP_04_1_New_Quitline_Age_Counts",
          "HP_04_2_Discontinued_Age_Counts",
          "HP_04_3_Dropout_Age_Counts",
          "HP_04_4_NRT_Counts"
        ]'
      )
    WHERE id = '${BASE_REPORT_ID}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{rowDataElementGroupSets}',
        '[
          "HP_04_New_Quitline_Age_Counts",
          "HP_04_Discontinued_Age_Counts",
          "HP_04_NRT_Counts"
        ]'
      )
    WHERE id = '${BASE_REPORT_ID}';
  `);
};

exports._meta = {
  version: 1,
};
