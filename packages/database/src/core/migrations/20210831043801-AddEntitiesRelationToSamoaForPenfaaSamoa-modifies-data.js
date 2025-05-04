'use strict';

import { insertObject, generateId, deleteObject } from '../utilities';

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

const projectCode = 'penfaa_samoa';

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record?.rows[0].id;
};

const getEntityRelations = async db => {
  const record = await db.runSql(`
    SELECT er.parent_id, er.child_id FROM entity_relation er 
    JOIN entity e ON er.child_id = e.id AND e."type" = 'sub_district' AND e.name not like 'Unknown%'
    WHERE er.entity_hierarchy_id in (SELECT eh.id from entity_hierarchy eh where eh."name" = 'covid_samoa'); 
  `);
  return record?.rows;
};

exports.up = async function (db) {
  const entityHierarchyId = generateId();
  await insertObject(db, 'entity_hierarchy', {
    id: entityHierarchyId,
    name: projectCode,
    canonical_types: '{country,district,school}',
  });

  const samoaHierarchyRelations = await getEntityRelations(db);
  Promise.all(
    samoaHierarchyRelations.map(async relation => {
      await insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: relation.parent_id,
        child_id: relation.child_id,
        entity_hierarchy_id: entityHierarchyId,
      });
    }),
  );
};

exports.down = async function (db) {
  const entityHierarchyId = await hierarchyNameToId(db, projectCode);
  await deleteObject(db, 'entity_relation', { entity_hierarchy_id: entityHierarchyId });
  await deleteObject(db, 'entity_hierarchy', { name: projectCode });
};

exports._meta = {
  version: 1,
};
