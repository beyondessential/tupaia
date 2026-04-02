'use strict';

import { codeToId, updateValues } from '../utilities';

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

const FACILITIES = [
  {
    code: 'SB_50205',
    newName: 'Vura (Central)',
  },
  {
    code: 'SB_10107',
    newName: 'Vura (Guadalcanal)',
  },
];

exports.up = async function (db) {
  for (const { code, newName } of FACILITIES) {
    const facilityId = await codeToId(db, 'entity', code);
    await updateValues(db, 'entity', { name: newName }, { id: facilityId });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
