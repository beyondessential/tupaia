'use strict';

import { insertObject, nameToId, generateId, updateValues } from '../utilities';

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

const newGroups = [
  {
    name: 'Fanafana Ola Super Admin',
    parentName: 'BES Data Admin',
  },
  {
    name: 'Fanafana Ola PHI Admin',
    parentName: 'Fanafana Ola Super Admin',
  },
  {
    name: 'Surveillance PHI',
    parentName: 'Fanafana Ola PHI Admin',
  },
  {
    name: 'Nauru eHealth Super Admin',
    parentName: 'BES Data Admin',
  },
  {
    name: 'Nauru eHealth PHI Admin',
    parentName: 'Nauru eHealth Super Admin',
  },
  {
    name: 'NCD PHI',
    parentName: 'Nauru eHealth PHI Admin',
  },
];

const updateGroups = [
  {
    name: 'Fanafana Ola Admin',
    updatedParentName: 'Fanafana Ola Super Admin',
  },
  {
    name: 'Nauru eHealth Admin',
    updatedParentName: 'Nauru eHealth Super Admin',
  },
];

exports.up = async function (db) {
  for (const { name, parentName } of newGroups) {
    const parentGroupId = await nameToId(db, 'permission_group', parentName);
    await insertObject(db, 'permission_group', {
      id: generateId(),
      name,
      parent_id: parentGroupId,
    });
  }

  for (const { name, updatedParentName } of updateGroups) {
    const parentGroupId = await nameToId(db, 'permission_group', updatedParentName);
    await updateValues(db, 'permission_group', { parent_id: parentGroupId }, { name });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
