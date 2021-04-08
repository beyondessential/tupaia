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

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};
const getEntityParentId = async (db, code) => {
  const record = await db.runSql(`SELECT parent_id FROM entity WHERE code = '${code}'`);
  return record.rows[0] && record.rows[0].parent_id;
};
const projectCode = 'laos_eoc';
const subFacilityCodes = [
  'LA-VT CHW Children',
  'LA-VT CHW Mahosot',
  'LA-VT CHW Mittaphap',
  'LA-VT CHW Mother & Child',
  'LA-VT CHW Setthathirath',
  'LA-AT PHW',
  'LA-BK PHW',
  'LA-BL PHW',
  'LA-CH PHW',
  'LA-HO PHW',
  'LA-KH PHW',
  'LA-LM PHW',
  'LA-LP PHW',
  'LA-OU PHW',
  'LA-PH PHW',
  'LA-SL PHW',
  'LA-SV PHW',
  'LA-VI PHW',
  'LA-XA PHW',
  'LA-XS PHW',
  'LA-XE PHW',
  'LA-XI PHW',
];

exports.up = async function (db) {
  await db.runSql(
    `UPDATE entity_hierarchy SET canonical_types = canonical_types || '{sub_facility}' WHERE name = '${projectCode}';`,
  );

  for (const subFacilityCode of subFacilityCodes) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: await getEntityParentId(db, subFacilityCode),
      child_id: await codeToId(db, 'entity', subFacilityCode),
      entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
    });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
