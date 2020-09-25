'use strict';

import { insertObject, generateId } from '../utilities';

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

const WORLD_MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'World',
  code: 'World_Group',
};

exports.up = function(db) {
  return insertObject(db, 'map_overlay_group', WORLD_MAP_OVERLAY_GROUP);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM map_overlay_group
    WHERE code = '${WORLD_MAP_OVERLAY_GROUP.code}'
  `);
};

exports._meta = {
  version: 1,
};
