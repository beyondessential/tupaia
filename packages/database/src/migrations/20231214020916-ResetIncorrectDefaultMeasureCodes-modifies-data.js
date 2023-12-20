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
    UPDATE project
    SET default_measure = map_overlay.code
    FROM map_overlay
    WHERE map_overlay.id = project.default_measure;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
