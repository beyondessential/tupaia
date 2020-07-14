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
    CREATE TABLE public.map_overlay_group (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      top_level BOOLEAN
    );

    CREATE TABLE public.map_overlay_group_link (
      id TEXT PRIMARY KEY,
      map_overlay_group_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      child_type TEXT NOT NULL
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE public.map_overlay_group;

    DROP TABLE public.map_overlay_group_link;
  `);
};

exports._meta = {
  version: 1,
};
