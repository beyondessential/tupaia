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
  db.runSql(`
  UPDATE "dashboardReport"
  SET "queryJson" =
    '{
      "dataElementGroupCode": "Maternal_Immunization_Services",
      "dataElementColumnTitle": "Number",
      "columnTitle": "Maternal Immunization Services",
      "stripFromRowNames": "Number Immunized with "
    }'
  WHERE id = 'TO_RH_Validation_IMMS04'
  `);
  return db.runSql(`
  UPDATE "dashboardReport"
  SET "queryJson" =
    '{
      "dataElementGroupCode": "Health_Promotion_Sessions",
      "dataElementColumnTitle": "Number",
      "columnTitle": "Health Promotion Session",
      "stripFromRowNames": "Monthly Health Promotion: "
    }'
  WHERE id = 'TO_RH_Validation_MCH07'
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
