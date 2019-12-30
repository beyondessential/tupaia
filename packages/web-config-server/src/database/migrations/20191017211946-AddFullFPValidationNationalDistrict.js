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
    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code", "viewMode")
        SELECT 'Country', "userGroup", "organisationUnitCode", "dashboardReports", "name", 'Tonga_Reproductive_Health_Country_Validation', "viewMode"
        FROM "dashboardGroup"
        WHERE "code" = 'Tonga_Reproductive_Health_Facility_Validation';

    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code", "viewMode")
        SELECT 'Province', "userGroup", "organisationUnitCode", "dashboardReports", "name", 'Tonga_Reproductive_Health_Island_Group_Validation', "viewMode"
        FROM "dashboardGroup"
        WHERE "code" = 'Tonga_Reproductive_Health_Facility_Validation';

    UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", 'TO_RH_Validation_FP')
      WHERE "code" IN ('Tonga_Reproductive_Health_National', 'Tonga_Reproductive_Health_Island_Group');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup"
      WHERE "code" IN ('Tonga_Reproductive_Health_Country_Validation', 'Tonga_Reproductive_Health_Island_Group_Validation');

    UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Validation_FP"}'
      WHERE "code" IN ('Tonga_Reproductive_Health_National', 'Tonga_Reproductive_Health_Island_Group');
  `);
};

exports._meta = {
  version: 1,
};
