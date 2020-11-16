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
  DELETE FROM "public"."map_overlay_group_relation" WHERE "id"='5f88d3a361f76a2d3f000012';
  `)
};

exports.down = function(db) {
  return db.runSql(`
  INSERT INTO "public"."map_overlay_group_relation"("id", "map_overlay_group_id", "child_id", "child_type") VALUES('5f88d3a361f76a2d3f000012', '5f88d3a361f76a2d3f000004', '5f2c7ddb61f76a513a000037', 'mapOverlayGroup') 
  RETURNING "id", "map_overlay_group_id", "child_id", "child_type", "sort_order";
  `)
};

exports._meta = {
  "version": 1
};
