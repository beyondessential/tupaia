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
    SET "viewJson" = "viewJson" || '{"name": "Weekly % of all consultations positive for malaria"}'
    WHERE id = 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"name": "Weekly % of Positive Malaria Consultations"}'
    WHERE id = 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations';
  `);
};

exports._meta = {
  "version": 1
};
