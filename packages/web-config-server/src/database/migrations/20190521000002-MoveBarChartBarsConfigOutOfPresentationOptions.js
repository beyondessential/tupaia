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
/**
 * Firstly, copy the contents of presentationOptions into a new field named barConfig,
 * then delete the old presentationOptions object.
 *
 * Decided to explicitly target all the relevant reports instead of
 * targeting all bar chart reports with presentation options for safety
 * as I've already added a migration with new presentationOptions to a bar chart
 * in another PR, which would be removed if this one ran after it.
 */
exports.up = function(db) {
  return db.runSql(`
  UPDATE
    "dashboardReport"
  SET
    "viewJson" = jsonb_set("viewJson", '{barConfig}', "viewJson"::jsonb#>'{presentationOptions}')
  WHERE
    id = 'TO_RH_D07.1' OR
    id = '36' OR
    id = 'SB_IHR_Bar' OR
    id = 'TO_RH_Descriptive_IMMS01_03' OR
    id = 'TO_RH_Descriptive_FP01_03' OR
    id = 'TO_RH_Descriptive_MCH05_01' OR
    id = 'TO_RH_Descriptive_IMMS01_02';


  UPDATE
    "dashboardReport"
  SET
    "viewJson" = "viewJson"::jsonb - 'presentationOptions'
  WHERE
    id = 'TO_RH_D07.1' OR
    id = '36' OR
    id = 'SB_IHR_Bar' OR
    id = 'TO_RH_Descriptive_IMMS01_03' OR
    id = 'TO_RH_Descriptive_FP01_03' OR
    id = 'TO_RH_Descriptive_MCH05_01' OR
    id = 'TO_RH_Descriptive_IMMS01_02';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
