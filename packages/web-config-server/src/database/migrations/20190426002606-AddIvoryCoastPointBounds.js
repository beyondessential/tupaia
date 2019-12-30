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
  // recalc bounds for each point -- this governs where the map will zoom to
  // (should have been run on initial migration)
  return db.runSql(`
    UPDATE "entity"
      SET 
        "bounds" = ST_Expand(ST_Envelope("point"::geometry), 1)
      WHERE 
        "bounds" IS NULL
        AND "point" IS NOT NULL;
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
