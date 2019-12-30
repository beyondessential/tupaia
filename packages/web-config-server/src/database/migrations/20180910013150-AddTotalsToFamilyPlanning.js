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
    SET "queryJson" = "queryJson" || '{"shouldShowTotalsRow": true}'
    WHERE id IN ('TO_RH_Validation_MCH07', 'TO_RH_Validation_IMMS01', 'TO_RH_Validation_IMMS03', 'TO_RH_Validation_IMMS04', 'TO_RH_Validation_IMMS05')
    ;
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
