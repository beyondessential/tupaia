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
      SET "presentationOptions" = '{"default": "explore"}'
      WHERE
        "name" = 'Operational facilities';

    UPDATE "mapOverlay"
      SET "presentationOptions" = '{"default": "disaster"}'
      WHERE
        ("name" = 'Facility type' AND "groupName" = 'Disaster response');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
      SET "presentationOptions" = NULL
      WHERE
        "name" = 'Operational facilities'
        OR ("name" = 'Facility type' AND "groupName" = 'Disaster response');
  `);
};

exports._meta = {
  version: 1,
};
