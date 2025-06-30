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

/**
 *
 *
 * @param db
 * @returns {{replacementParams: *, query: *}}
 */
exports.up = function (db) {
  db.runSql(`ALTER TABLE project DROP COLUMN IF EXISTS tile_sets;`);
  return db.addColumn('project', 'config', {
    type: 'jsonb',
    defaultValue: '{ "permanentRegionLabels": true }',
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
