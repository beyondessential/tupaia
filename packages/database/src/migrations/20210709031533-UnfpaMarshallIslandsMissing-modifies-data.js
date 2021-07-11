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

const entityHierarchyName = 'unfpa';
const ancestorEntityName = 'UNFPA';

export const nameToId = async (db, table, name) => {
  const record = await db.runSql(`SELECT id FROM "${table}" WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const entityHierarchyId = await nameToId(db, 'entity_hierarchy', entityHierarchyName);
  const facilities = (
    await db.runSql(`
    SELECT * from entity 
    WHERE country_code = 'MH' AND "type" = 'facility'; 
 `)
  ).rows;

  for (const facility of facilities) {
    const { parent_id: ancestorId, id: descendantId } = facility;
    // console.log(facility);
    await insertObject(db, 'ancestor_descendant_relation', {
      id: generateId(),
      entity_hierarchy_id: entityHierarchyId,
      ancestor_id: ancestorId,
      descendant_id: descendantId,
      generational_distance: 3,
    });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
