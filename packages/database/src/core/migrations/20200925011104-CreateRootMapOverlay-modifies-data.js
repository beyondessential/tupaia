'use strict';

import { insertObject, generateId } from '../utilities';

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

const ROOT_MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Root',
  code: 'Root',
};

exports.up = function (db) {
  return insertObject(db, 'map_overlay_group', ROOT_MAP_OVERLAY_GROUP);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM map_overlay_group
    WHERE code = '${ROOT_MAP_OVERLAY_GROUP.code}'
  `);
};

exports._meta = {
  version: 1,
};
