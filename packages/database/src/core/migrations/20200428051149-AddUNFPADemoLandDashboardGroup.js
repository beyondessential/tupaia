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

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES (
      'Facility',
      'UNFPA',
      'DL',
      '{"UNFPA_RH_Contraceptives_Offered","UNFPA_RH_Services_Offered","UNFPA_Staff_Trained_Matrix"}',
	    'UNFPA',
      'DL_Unfpa_Facility'
    );

    INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
    VALUES (
      'Country',
      'UNFPA',
      'DL',
      '{"UNFPA_Priority_Medicines_AMC","UNFPA_Priority_Medicines_SOH","UNFPA_Priority_Medicines_MOS","UNFPA_Monthly_3_Methods_of_Contraception","UNFPA_Monthly_5_Methods_of_Contraception","UNFPA_Facilities_Offering_Services","UNFPA_Facilities_Offering_Delivery","UNFPA_RH_Stock_Cards"}',
      'UNFPA',
      'DL_Unfpa_Country'
    );
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE code = 'DL_Unfpa_Facility';

    DELETE FROM "dashboardGroup"
    WHERE code = 'DL_Unfpa_Country';
  `);
};

exports._meta = {
  version: 1,
};
