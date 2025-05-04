'use strict';

import { generateId, insertObject } from '../utilities';

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
  await insertObject(db, 'permission_group', {
    id: generateId(),
    name: 'PSSS Tupaia',
    parent_id: '59085f2dfc6a0715dae508e3', // Admin
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
