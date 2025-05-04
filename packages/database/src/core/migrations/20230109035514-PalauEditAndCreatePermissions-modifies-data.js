'use strict';

import { deleteObject, updateValues } from '../utilities';

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

const PERMISSION_GROUPS = {
  nameAndParentChange: [
    {
      id: '60e66e7361f76a6e8803101c',
      name: 'Palau Behavioural Health',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },

    {
      id: '61f775cfd6e5f034fd1527e6',
      name: 'Palau COVID-19',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '6296bcb652e7897cf500273c',
      name: 'Palau Public Health Nursing Unit',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
  ],
  parentChangeOnly: [
    {
      id: '62cd0196a1110f2666003e82',
      parent_id: '639aba23dbde622fb60dad76',
    },
    {
      id: '639abb94dbde622fb60dae49',
      parent_id: '639aba23dbde622fb60dad76',
    },
    {
      id: '6221754ff4bae84c690f80a9',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '6283037f717cba22280062b6',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '627b5c0d052c6c2181002d97',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '6243ab627c6c003b3906a2b5',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '630fb5ff268b8f423f01a0f0',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
    {
      id: '62830b2e717cba2228007685',
      parent_id: '62e1f49fdb5a0076ef0169bb',
    },
  ],
};

const DELETE_PERMISSION_GROUP_ID = '627b5c30052c6c2181002dcb';

const TABLE_NAME = 'permission_group';

exports.up = async function (db) {
  for (const permissionGroup of PERMISSION_GROUPS.nameAndParentChange) {
    await updateValues(
      db,
      TABLE_NAME,
      { name: permissionGroup.name, parent_id: permissionGroup.parent_id },
      { id: permissionGroup.id },
    );
  }

  for (const permissionGroup of PERMISSION_GROUPS.parentChangeOnly) {
    await updateValues(
      db,
      TABLE_NAME,
      { parent_id: permissionGroup.parent_id },
      { id: permissionGroup.id },
    );
  }

  return deleteObject(db, TABLE_NAME, { id: DELETE_PERMISSION_GROUP_ID });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
