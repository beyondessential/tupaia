'use strict';

import { insertObject, arrayToDbString, generateId } from '../utilities';

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

const wishHierarchyId = '5e9d06e261f76a30c4000015'; // WISH FJ
const getFacilities = db =>
  db.runSql(`
  select id, parent_id from entity where type = 'facility' and country_code = 'FJ';
`);

const insertEntityRelation = async (db, parentId, childId, hierarchyId) => {
  const result = await db.runSql(`
      insert into entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      values (
        '${generateId()}',
        '${parentId}',
        '${childId}',
        '${hierarchyId}'
      );
    `);
};

exports.up = async function (db) {
  const facilities = await getFacilities(db);

  facilities.rows.map(async facility => {
    await insertEntityRelation(db, facility.parent_id, facility.id, wishHierarchyId);
  });
};

exports.down = async function (db) {
  const facilities = await getFacilities(db);
  const facilityIds = facilities.rows.map(fac => fac.id);
  return db.runSql(`
    delete from entity_relation where child_id in (${arrayToDbString(
      facilityIds,
    )}) and entity_hierarchy_id = '${wishHierarchyId}';
  `);
};

exports._meta = {
  version: 1,
};
