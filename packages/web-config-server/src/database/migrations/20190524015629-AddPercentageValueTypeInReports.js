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
      "viewJson" = "viewJson" || jsonb_build_object('valueType', 'percentage')
    WHERE
      "id" IN ('TO_RH_Descriptive_FP01_02', 'TO_CH_DM_HTN_Prevalence');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" - 'valueType'
    WHERE
      "id" IN ('TO_RH_Descriptive_FP01_02', 'TO_CH_DM_HTN_Prevalence');
  `);
};

exports._meta = {
  version: 1,
};
