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
    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES (
      'Country',
      'UNFPA',
      'TO',
      '{UNFPA_Monthly_3_Methods_of_Contraception,UNFPA_Monthly_5_Methods_of_Contraception,UNFPA_Facilities_Offering_Services,UNFPA_Facilities_Offering_Delivery}',
      'UNFPA',
      'TO_Unfpa_Country'
    );

      INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
      VALUES (
        'Province',
        'UNFPA',
        'TO',
        '{UNFPA_Monthly_3_Methods_of_Contraception,UNFPA_Monthly_5_Methods_of_Contraception,UNFPA_Facilities_Offering_Services,UNFPA_Facilities_Offering_Delivery}',
        'UNFPA',
        'TO_Unfpa_Province'
      );

      INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
      VALUES (
        'Facility',
        'UNFPA',
        'TO',
        '{UNFPA_RH_Contraceptives_Offered,UNFPA_RH_Services_Offered}',
        'UNFPA',
        'TO_Unfpa_Facility'
      );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
