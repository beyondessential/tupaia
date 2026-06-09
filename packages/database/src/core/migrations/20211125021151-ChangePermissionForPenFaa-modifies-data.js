'use strict';

import { updateValues } from '../utilities';

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

exports.up = async function (db) {
  await updateValues(db, 'permission_group', { name: 'PEN Faa' }, { name: `PEN Fa'a` });
  return updateValues(
    db,
    'permission_group',
    { name: 'PEN Faa Admin' },
    { name: `PEN Fa'a Admin` },
  );
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
