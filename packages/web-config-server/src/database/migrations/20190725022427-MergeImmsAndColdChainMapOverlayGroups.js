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
    SET "groupName" = 'Cold Chain/Immunisation'
    WHERE
    "groupName" IN (
      'Cold Chain',
      'Immunisation'
    );

    UPDATE "mapOverlay"
    SET "sortOrder" = -4
    WHERE "name" = 'Temperature Breaches (48 hours)';

    UPDATE "mapOverlay"
    SET "sortOrder" = -3
    WHERE "name" = 'Temperature Breaches (30 days)';

    UPDATE "mapOverlay"
    SET "sortOrder" = -2
    WHERE "name" = 'Stock on Hand x Breaches (30 days)';

    UPDATE "mapOverlay"
    SET "sortOrder" = -1
    WHERE "name" = 'SOH Value';

    UPDATE "mapOverlay"
    SET "sortOrder" = 169
    WHERE "name" = 'Staff Trained in Immunisations';

    UPDATE "mapOverlay"
    SET "sortOrder" = 170
    WHERE "name" = 'Two rounds of outreach funding received';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
