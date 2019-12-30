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
    CREATE TYPE entity_type AS ENUM (
      'facility',
      'region',
      'country',
      'disaster',
      'world'
    );
    
    CREATE TABLE "entity" (
      id VARCHAR(32) PRIMARY KEY,
      code VARCHAR(32) UNIQUE NOT NULL,
      parent_code VARCHAR(32),
      name VARCHAR(32) NOT NULL,
      type entity_type,
      point GEOGRAPHY(POINT),
      region GEOGRAPHY(POLYGON)
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE "entity";
    DROP TYPE "entity_type";
  `);
};

exports._meta = {
  version: 1,
};
