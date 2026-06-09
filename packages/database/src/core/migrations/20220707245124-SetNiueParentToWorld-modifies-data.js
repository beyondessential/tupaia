'use strict';

import { codeToId } from '../utilities';

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
  const parentId = await codeToId(db, 'entity', 'World');
  await db.runSql(`
      UPDATE "entity"
      SET "parent_id" = '${parentId}'
      WHERE "code" = 'NU';
    `);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
