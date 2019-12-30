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
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" - 'barConfig' || jsonb_build_object('chartConfig', "viewJson"::jsonb->'barConfig')
    WHERE
      "viewJson" ? 'barConfig';
  `);
};

exports.down = function(db) {
  // Target only the specific reports which were affected by this change
  // when the migration was created
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" - 'chartConfig' || jsonb_build_object('barConfig', "viewJson"::jsonb->'chartConfig')
    WHERE
      "id" IN (
        '36',
        'SB_IHR_Bar',
        'TO_RH_Descriptive_IMMS01_03',
        'TO_RH_Descriptive_FP01_03',
        'TO_CH_Home_Visits',
        'TO_RH_Descriptive_MCH05_01',
        'TO_RH_Descriptive_IMMS01_02',
        'TO_RH_D07.1'
      );
  `);
};

exports._meta = {
  version: 1,
};
