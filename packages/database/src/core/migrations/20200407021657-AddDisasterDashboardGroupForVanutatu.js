'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code"
      )
      SELECT "organisationLevel", 
            "userGroup", 
            'VU',
            "dashboardReports",
            "name",
            'Disaster_Response_Province_VU'
      FROM "dashboardGroup" WHERE "code"='Disaster_Response_Province_DL';

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code"
      )
      SELECT "organisationLevel", 
            "userGroup", 
            'VU',
            "dashboardReports",
            "name",
            'Disaster_Response_Country_VU'
      FROM "dashboardGroup" WHERE "code"='Disaster_Response_Country_DL';

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code"
      )
      SELECT "organisationLevel", 
            "userGroup", 
            'VU',
            "dashboardReports",
            "name",
            'Disaster_Response_Facility_VU'
      FROM "dashboardGroup" WHERE "organisationLevel"='Facility' AND "name"='Disaster Response';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" where code = 'Disaster_Response_Province_VU';
    DELETE FROM "dashboardGroup" where code = 'Disaster_Response_Country_VU';
    DELETE FROM "dashboardGroup" where code = 'Disaster_Response_Facility_VU';
  `);
};

exports._meta = {
  version: 1,
};
