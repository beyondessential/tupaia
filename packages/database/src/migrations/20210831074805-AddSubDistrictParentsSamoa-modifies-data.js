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

const getEntityRelations = async db => {
  const record = await db.runSql(`
    SELECT er.parent_id, er.child_id FROM entity_relation er 
    JOIN entity e ON er.child_id = e.id AND e."type" = 'sub_district' AND e.name not like 'Unknown%'
    WHERE er.entity_hierarchy_id in (SELECT eh.id from entity_hierarchy eh where eh."name" = 'covid_samoa'); 
  `);
  return record?.rows;
};

exports.up = async function (db) {
  const samoaHierarchyRelations = await getEntityRelations(db);
  Promise.all(
    samoaHierarchyRelations.map(async ({ parent_id: parentId, child_id: childId }) => {
      await updateValues(db, 'entity', { parent_id: parentId }, { id: childId });
    }),
  );
};

exports.down = async function (db) {
  const samoaHierarchyRelations = await getEntityRelations(db);
  Promise.all(
    samoaHierarchyRelations.map(async ({ child_id: childId }) => {
      await updateValues(db, 'entity', { parent_id: null }, { id: childId });
    }),
  );
};

exports._meta = {
  version: 1,
};
