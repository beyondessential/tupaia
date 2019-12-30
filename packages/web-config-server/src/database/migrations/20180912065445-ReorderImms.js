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
    SET "queryJson" = "queryJson" || '{"dataElementCodes": [ "IMMS12", "IMMS11", "IMMS13", "IMMS14", "IMMS15", "IMMS17", "IMMS18", "IMMS19", "IMMS16", "IMMS21", "IMMS22", "IMMS20"]}'
    WHERE id = 'TO_RH_Validation_IMMS03';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
