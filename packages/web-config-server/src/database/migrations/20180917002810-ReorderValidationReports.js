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
  return db.runSql(
    `UPDATE "dashboardGroup" SET "dashboardReports" = '{TO_RH_D07.1,TO_RH_Validation_FP,TO_RH_Validation_FP_ECP,TO_RH_Validation_MCH01_Total,TO_RH_Validation_MCH01,TO_RH_Validation_MCH03,TO_RH_Validation_MCH05,TO_RH_Validation_MCH06,TO_RH_Validation_MCH07,TO_RH_Validation_IMMS01,TO_RH_Validation_IMMS03,TO_RH_Validation_IMMS04,TO_RH_Validation_IMMS05}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
