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

// There are some old geographical areas hanging around, not attached to anything. Delete them.
exports.up = function(db) {
  return db.runSql(`
    DELETE FROM geographical_area
    WHERE id NOT IN
      (SELECT parent_id
        FROM geographical_area
        WHERE parent_id IS NOT NULL)
    AND id NOT IN
      (SELECT geographical_area_id
        FROM clinic);
    -- Run again to delete any now orphaned parent geographical areas
    DELETE FROM geographical_area
    WHERE id NOT IN
      (SELECT parent_id
        FROM geographical_area
        WHERE parent_id IS NOT NULL)
    AND id NOT IN
      (SELECT geographical_area_id
        FROM clinic);
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
