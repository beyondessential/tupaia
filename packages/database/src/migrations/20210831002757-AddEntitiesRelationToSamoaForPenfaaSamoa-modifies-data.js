'use strict';

import { insertObject, codeToId, generateId, deleteObject } from '../utilities';
import samoaHierarchyData from './migrationData/20210831002757-AddEntitiesRelationToSamoaForPenfaaSamoa/Entites_Hierarchy_Pen_Faa.json';

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

exports.up = async function (db) {
  const entityHierarchyId = generateId();
  await insertObject(db, 'entity_hierarchy', {
    id: entityHierarchyId,
    name: projectCode,
    canonical_types: '{country,district,sub_district,school}',
  });

  Promise.all(
    samoaHierarchyData.map(async ({ parent_code: parentCode, code }) => {
      const parentId = await codeToId(db, 'entity', parentCode);
      const childId = await codeToId(db, 'entity', code);
      await insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: parentId,
        child_id: childId,
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
