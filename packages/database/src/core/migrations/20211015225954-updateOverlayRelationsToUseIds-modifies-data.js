'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
  UPDATE map_overlay_group_relation
  SET child_id =
    (SELECT id FROM map_overlay
     WHERE map_overlay.code = map_overlay_group_relation.child_id)
  WHERE child_type = 'mapOverlay';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  UPDATE map_overlay_group_relation
  SET child_id =
    (SELECT code FROM map_overlay
     WHERE map_overlay.id = map_overlay_group_relation.child_id)
  WHERE child_type = 'mapOverlay';
  `);
};

exports._meta = {
  version: 1,
};
