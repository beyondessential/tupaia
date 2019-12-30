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
    SET "queryJson" = "queryJson" || '{"rowDataElementGroupSets": [ "Service_Group_Home", "Service_Group_Clinic" ], "columnDataElementGroupSet": "Monthly_Home_Clinic_Visits"}'
    WHERE id = 'TO_RH_Validation_MCH03';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
