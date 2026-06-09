'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

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
  return insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', 'psss'),
    child_id: await codeToId(db, 'entity', 'NZ'),
    entity_hierarchy_id: await hierarchyNameToId(db, 'psss'),
  });
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM entity_relation
    WHERE parent_id = '${await codeToId(db, 'entity', 'psss')}' AND child_id = '${await codeToId(
    db,
    'entity',
    'NZ',
  )}';
  `);
};

exports._meta = {
  version: 1,
};
