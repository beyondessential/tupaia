'use strict';

import { deleteObject, nameToId } from '../utilities';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const PERMISSION_GROUP_NAME = 'DEH Vector Surveillance';

exports.up = async function (db) {
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP_NAME);
  await deleteObject(db, 'permission_group', { id: permissionGroupId });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
