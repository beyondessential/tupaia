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
    SET "viewJson" = "viewJson" || '{"name": "Weekly % of positive mRDT cases and febrile illness case count"}'
    WHERE id = 'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"name": "Weekly Number of Febrile Cases"}'
    WHERE id = 'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases';
  `);
};

exports._meta = {
  "version": 1
};
