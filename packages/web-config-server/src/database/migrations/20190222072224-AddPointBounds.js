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
    UPDATE "entity"
      SET "bounds" = ST_Expand(ST_Envelope("point"::geometry), 1)
      WHERE "type" = 'facility';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "entity"
      SET "bounds" = null
      WHERE "type" = 'facility';
  `);
};

exports._meta = {
  version: 1,
};
