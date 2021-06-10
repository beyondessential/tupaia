'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const subDistrictCodes = [
  'FJ_sdNaitasiri',
  'FJ_sdRewa_Nausori',
  'FJ_sdSerua_Namosi',
  'FJ_sdSuva',
  'FJ_sdTailevu',
  'FJ_sdNasinu',
  'FJ_sdKadavu',
  'FJ_sdLakeba',
  'FJ_sdLomaiviti',
  'FJ_sdLomaloma',
  'FJ_sdRotuma',
  'FJ_sdBua',
  'FJ_sdCakaudrove',
  'FJ_sdMacuata',
  'FJ_sdTaveuni',
  'FJ_sdBa',
  'FJ_sdLautoka_Yasawa',
  'FJ_sdNadi',
  'FJ_sdNadroga',
  'FJ_sdRa',
  'FJ_sdTavua',
];
const hierarchyName = 'supplychain_fiji';

exports.up = async function (db) {
  const hierarchyId = (
    await db.runSql(`
    select id from entity_hierarchy where "name" = '${hierarchyName}';
  `)
  ).rows[0].id;

  console.log('hierarchyId', hierarchyId);

  const subDistricts = (
    await db.runSql(`
    select id, parent_id 
    from "entity" where code in (${arrayToDbString(subDistrictCodes)});
  `)
  ).rows;

  console.log('subDistricts', subDistricts);

  await Promise.all(
    subDistricts.map(({ id: subDistrictId, parent_id: parentId }) =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: parentId,
        child_id: subDistrictId,
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
