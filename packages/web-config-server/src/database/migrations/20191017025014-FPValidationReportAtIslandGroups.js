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
    UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Validation_FP"}'
      WHERE "code" IN ('Tonga_Reproductive_Health_National', 'Tonga_Reproductive_Health_Island_Group');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", 'TO_RH_Validation_FP')
      WHERE "code" IN ('Tonga_Reproductive_Health_National', 'Tonga_Reproductive_Health_Island_Group');
  `);
};

exports._meta = {
  version: 1,
};
