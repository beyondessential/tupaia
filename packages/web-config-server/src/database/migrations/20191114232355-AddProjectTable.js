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
    CREATE TABLE "project" (
      id text PRIMARY KEY,
      code text UNIQUE NOT NULL,
      user_group text NOT NULL,
      entities text[] NOT NULL,
      name text UNIQUE NOT NULL,
      description text,
      sort_order integer,
      image_url text,
      theme jsonb NOT NULL default '{"text":"#000000","background":"#ffffff"}'::jsonb
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE "project";
  `);
};

exports._meta = {
  version: 1,
};
