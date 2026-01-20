'use strict';

import { nameToId, updateValues } from '../utilities';

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

const PARENT_NAME = 'Fanafana Ola Admin';
const CHILD_NAME = 'COVID-19 Senior';

exports.up = async function (db) {
  const parentId = await nameToId(db, 'permission_group', PARENT_NAME);
  const childId = await nameToId(db, 'permission_group', CHILD_NAME);
  await updateValues(db, 'permission_group', { parent_id: parentId }, { id: childId });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
