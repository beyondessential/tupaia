'use strict';

import { updateValues, insertObject, generateId } from '../utilities';

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

const getSubDistrictEntityRelations = async db => {
  const record = await db.runSql(`
    SELECT er.parent_id, er.child_id FROM entity_relation er 
    JOIN entity e ON er.child_id = e.id AND e."type" = 'sub_district'
    WHERE er.entity_hierarchy_id in (SELECT eh.id from entity_hierarchy eh where eh."name" = '${projectCode}'); 
  `);
  return record?.rows;
};

const getSchools = async db => {
  const { rows } = await db.runSql(`
  SELECT e.parent_id, e.id FROM entity e
  WHERE e."type" = 'school' and e.country_code = 'WS';
`);
  return rows;
};

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record?.rows[0].id;
};

exports.up = async function (db) {
  const entityHierarchyId = await hierarchyNameToId(db, projectCode);
  const subDistrictEntityRelations = await getSubDistrictEntityRelations(db);

  const subDistrictToDistrictMapping = Object.fromEntries(
    subDistrictEntityRelations.map(relation => [relation.child_id, relation.parent_id]),
  );
  const schoolEntities = await getSchools(db);
  Promise.all(
    schoolEntities.map(async entity => {
      // school to sub_district entity relation
      await insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: entity.parent_id,
        child_id: entity.id,
        entity_hierarchy_id: entityHierarchyId,
      });

      // update school entity parent id as associated district id
      await updateValues(
        db,
        'entity',
        { parent_id: subDistrictToDistrictMapping[entity.parent_id] },
        { id: entity.id },
      );
    }),
  );
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
