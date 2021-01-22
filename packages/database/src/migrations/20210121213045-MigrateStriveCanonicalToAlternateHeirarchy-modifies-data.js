'use strict';

import { arrayToDbString, generateId, insertObject, updateValues } from '../utilities';

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

const striveHierarchyId = '5e9d06e261f76a30c4000018';
const countryCode = 'PG';
const countryId = '5d3f8844f327a531bfd8ad77';
const canonicalTypes = '{country,district,facility,village,case}';

// Explicity naming codes so not to be dependant on order of operations of importing districts for FEPT
const striveDistrictCodes = [
  'PG_Sandaun',
  'PG_National Capital District',
  'PG_Milne Bay ',
  'PG_New Ireland',
  'PG_Morobe',
  'PG_Simbu',
  'PG_Western',
  'PG_Madang',
];

const selectDistrictIds = (db, districtCodes) =>
  db.runSql(`select id from "entity" where code in (${arrayToDbString(districtCodes)})`);

const addDistrictEntityRelations = (db, ids) =>
  ids.map(id =>
    insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: countryId,
      child_id: id.id,
      entity_hierarchy_id: striveHierarchyId,
    }),
  );

const selectEntities = (db, entityType) =>
  db.runSql(
    `select id, parent_id from "entity" where country_code = '${countryCode}' and type = '${entityType}'`,
  );

const addEntityRelations = (db, entities) =>
  entities.map(entity =>
    insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: entity.parent_id,
      child_id: entity.id,
      entity_hierarchy_id: striveHierarchyId,
    }),
  );

exports.up = async function (db) {
  const districtIds = (await selectDistrictIds(db, striveDistrictCodes)).rows;
  await addDistrictEntityRelations(db, districtIds);

  const facilities = (await selectEntities(db, 'facility')).rows;
  await addEntityRelations(db, facilities);

  const villages = (await selectEntities(db, 'village')).rows;
  await addEntityRelations(db, villages);

  const cases = (await selectEntities(db, 'case')).rows;
  await addEntityRelations(db, cases);

  await updateValues(db, 'entity_hierarchy', { canonical_types: {} }, { id: striveHierarchyId });
};

exports.down = async function (db) {
  await db.runSql(
    `delete from entity_relation where entity_hierarchy_id = '${striveHierarchyId}' and child_id != '${countryId}'`,
  );
  await updateValues(
    db,
    'entity_hierarchy',
    { canonical_types: canonicalTypes },
    { id: striveHierarchyId },
  );
};

exports._meta = {
  version: 1,
};
