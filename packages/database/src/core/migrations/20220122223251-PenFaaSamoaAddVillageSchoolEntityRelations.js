'use strict';

import { schoolRelations } from './migrationData/20220122223251-PenFaaSamoaAddVillageSchoolEntityRelations/PenFaa Samoa school entity relations.json';
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

const hierarchyName = 'penfaa_samoa';
// We will copy the sub_district - village relationships from covid_samoa
const villageSourceHierarchy = 'covid_samoa';

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const removeExistingSchoolRelations = async (db, hierarchyId) => {
  return db.runSql(`
  delete from entity_relation
  where id in ( select er.id from entity_relation er 
    join entity c on er.child_id = c.id and c."type" = 'school'
    where er.entity_hierarchy_id = '${hierarchyId}');
`);
};

const getEntityIdsByType = async (db, entityType, countryCode) => {
  const { rows } = await db.runSql(`
    select e.code, e.id from entity e
    where e."type" = '${entityType}' and e.country_code = '${countryCode}';
  `);
  return Object.assign({}, ...rows.map(x => ({ [x.code]: x.id })));
};

const copyEntityRelations = async (db, sourceHierarchyId, destinationHierarchyId, childType) => {
  const { rows } = await db.runSql(`
    select er.parent_id, er.child_id  
    from entity_relation er 
    join entity c on er.child_id = c.id and c."type" = '${childType}'
    where er.entity_hierarchy_id = '${sourceHierarchyId}';
  `);

  await Promise.all(
    rows.map(row =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: row.parent_id,
        child_id: row.child_id,
        entity_hierarchy_id: destinationHierarchyId,
      }),
    ),
  );
};

exports.up = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, hierarchyName);
  const villageSourceHierarchyId = await hierarchyNameToId(db, villageSourceHierarchy);

  // copy sub_district - village entity relations from covid_samoa
  await copyEntityRelations(db, villageSourceHierarchyId, hierarchyId, 'village');

  // remove existing sub_district school relations
  await removeExistingSchoolRelations(db, hierarchyId);

  // remove school from hierarchy canonical_types
  await db.runSql(`
    update entity_hierarchy set canonical_types = '{country,district}' where name = 'penfaa_samoa';
  `);

  // get samoa school and village ids
  const schoolIds = await getEntityIdsByType(db, 'school', 'WS');
  const villageIds = await getEntityIdsByType(db, 'village', 'WS');

  const mappedSchools = schoolRelations.map(school => ({
    code: school.code,
    parentId: villageIds[school.parent_code],
    id: schoolIds[school.code],
  }));

  const schoolOrVillageNotFound = mappedSchools.filter(
    school => school.id === undefined || school.parentId === undefined,
  );
  console.log('School Or Village Not Found:', schoolOrVillageNotFound);

  await Promise.all(
    mappedSchools
      .filter(school => school.id !== undefined && school.parentId !== undefined)
      .map(school =>
        insertObject(db, 'entity_relation', {
          id: generateId(),
          parent_id: school.parentId,
          child_id: school.id,
          entity_hierarchy_id: hierarchyId,
        }),
      ),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
