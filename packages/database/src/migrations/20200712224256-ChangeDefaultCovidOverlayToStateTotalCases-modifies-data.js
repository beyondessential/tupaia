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

const mapOverlayId = 'COVID_AU_HOSPITALS_AND_TESTING_SITES';

exports.up = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay" SET "sortOrder" = 1 WHERE id = '${mapOverlayId}'; 
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay" SET "sortOrder" = 0 WHERE id = '${mapOverlayId}'; 
  `);
};

exports._meta = {
  version: 1,
};
