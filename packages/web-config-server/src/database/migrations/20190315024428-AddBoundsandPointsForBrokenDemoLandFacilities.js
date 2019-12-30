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
    SET "point" = 'SRID=4326;POINT(157.43408 -22.063252)'
    WHERE "code" = 'DL_2';

    UPDATE "entity"
    SET "bounds" = 'SRID=4326;POLYGON((156.43408 -23.063252,156.43408 -21.063252,158.43408 -21.063252,158.43408 -23.063252,156.43408 -23.063252))'
    WHERE "code" = 'DL_2';

    UPDATE "entity"
    SET "point" = 'SRID=4326;POINT(157.42 -22.15)'
    WHERE "code" = 'DL_11';

    UPDATE "entity"
    SET "bounds" = 'SRID=4326;POLYGON((156.42 -23.15,156.42 -21.15,158.42 -21.15,158.42 -23.15,156.42 -23.15))'
    WHERE "code" = 'DL_11';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
