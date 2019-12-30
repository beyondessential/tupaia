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
  UPDATE "dashboardReport"
  SET "queryJson" =
    '{
    "columnDataElementGroupSet": "FP_Change_Counts",
    "rowDataElementGroupSet": "FP_Method_Counts",
    "stripFromColumnNames": "Family Planning Change Counts - ",
    "stripFromRowNames": "Family Planning Method Counts - ",
    "shouldShowTotalsRow": true
    }'
  WHERE id = 'TO_RH_Validation_FP'
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
