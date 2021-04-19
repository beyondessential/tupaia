'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

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

const projectCode = 'laos_eoc';

exports.up = async function (db) {
  await db.runSql(
    `UPDATE entity_hierarchy SET canonical_types = canonical_types || '{sub_facility}' WHERE name = '${projectCode}';`,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
