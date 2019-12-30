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
    SET "queryJson" = "queryJson" || '{"dataElementCodes": [ "MCH3", "MCH5", "MCH6", "MCH7", "MCH8", "MCH9", "MCH10", "MCH11", "MCH12", "MCH13", "MCH14", "MCH2"]}'
    WHERE id = 'TO_RH_Validation_MCH01';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
