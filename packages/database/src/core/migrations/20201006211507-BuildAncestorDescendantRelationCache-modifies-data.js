'use strict';

var dbm;
var type;
var seed;

/**
 * Originally this migration constructed the EntityHierarchyCacher and warmed
 * `ancestor_descendant_relation` via `buildAndCacheHierarchies()`. TUP-3065
 * removed the cacher subsystem (entity hierarchies are now read directly via
 * `entity.parent_id`), so this old migration is reduced to a no-op shell — it
 * has long since been applied to every environment, but the file still has to
 * load cleanly when db-migrate scans the migrations directory.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function () {
  return null;
};

exports.down = function (db) {
  return db.runSql(`TRUNCATE TABLE ancestor_descendant_relation;`);
};

exports._meta = {
  version: 1,
};
