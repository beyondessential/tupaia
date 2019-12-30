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
    SET "queryJson" = "queryJson" || '{"shouldShowTotalsRow": false, "dataElementCodes": [ "MCH110",  "MCH111",  "MCH112",  "MCH113",  "MCH114",  "MCH115",  "MCH116",  "MCH117",  "MCH118",  "MCH119",  "MCH120", "MCH109_1"]}'
    WHERE id = 'TO_RH_Validation_MCH07';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
