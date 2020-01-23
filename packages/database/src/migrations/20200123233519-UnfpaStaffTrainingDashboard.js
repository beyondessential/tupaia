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
      'FM',
      '{"UNFPA_Monthly_3_Methods_of_Contraception","UNFPA_Monthly_5_Methods_of_Contraception","UNFPA_Facilities_Offering_Services","UNFPA_Facilities_Offering_Delivery","UNFPA_RH_Stock_Cards"}',
      'UNFPA',
      'FM_Unfpa_Country'
    );
    `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
