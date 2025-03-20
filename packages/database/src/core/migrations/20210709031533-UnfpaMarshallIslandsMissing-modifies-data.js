'use strict';

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

const hierarchyName = 'unfpa';

// country_code : entity_type
const entityRelationshipsToAdd = [
  {
    countryCode: 'MH',
    entityType: 'facility',
  },
];

const insertEntityRelations = async (db, hierarchyId, countryCode, entityType) => {
  const entities = (
    await db.runSql(`
    select id, parent_id from "entity" where country_code = '${countryCode}' and type = '${entityType}';   
  `)
  ).rows;

  return entities.map(entity =>
    insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: entity.parent_id,
      child_id: entity.id,
      entity_hierarchy_id: hierarchyId,
    }),
  );
};

exports.up = async function (db) {
  const hierarchyId = (
    await db.runSql(`
      select id from entity_hierarchy where "name" = '${hierarchyName}';
    `)
  ).rows[0].id;

  await Promise.all(
    entityRelationshipsToAdd.map(er =>
      insertEntityRelations(db, hierarchyId, er.countryCode, er.entityType),
    ),
  );
};

exports.down = async function (db) {
  const hierarchyId = (
    await db.runSql(`
    select id from entity_hierarchy where "name" = '${hierarchyName}';
  `)
  ).rows[0].id;

  await Promise.all(
    entityRelationshipsToAdd.map(er =>
      db.runSql(`
      delete from entity_relation 
      where entity_hierarchy_id = '${hierarchyId}' 
        and child_id in (select id from "entity" where country_code = '${er.countryCode}' and type = '${er.entityType}');
    `),
    ),
  );
};

exports._meta = {
  version: 1,
};
