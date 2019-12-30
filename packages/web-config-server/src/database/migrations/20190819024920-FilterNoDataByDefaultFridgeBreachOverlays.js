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
    UPDATE "mapOverlay"
    SET "presentationOptions" = '{"hideByDefault": {"null": true}}'
    WHERE name IN ('Temperature Breaches (48 hours)', 'Temperature Breaches (30 days)', 'Stock on Hand x Breaches (30 days)');
`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
