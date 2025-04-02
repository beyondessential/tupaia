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
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}';`);
  return record?.rows[0].id;
};

const WAIVIVIA_CODE = 'FJ_WAV';
const BURETA_CODE = 'FJ_CATCH_Bureta';
const FIJI_CODE = 'FJ';
const EASTERN_CODE = 'FJ_Eastern';
const projectCode = 'wish';

exports.up = async function (db) {
  const WAIVIVIA_ID = await codeToId(db, 'entity', WAIVIVIA_CODE);
  const BURETA_ID = await codeToId(db, 'entity', BURETA_CODE);
  const FIJI_ID = await codeToId(db, 'entity', FIJI_CODE);
  if (!(WAIVIVIA_ID && BURETA_ID)) {
    throw new Error('Entities not found');
  }

  await db.runSql(`
    UPDATE entity 
    SET parent_id = '${FIJI_ID}'
    WHERE code = '${WAIVIVIA_CODE}';
  `);

  const hierarchyId = await hierarchyNameToId(db, projectCode);
  if (hierarchyId) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: BURETA_ID,
      child_id: WAIVIVIA_ID,
      entity_hierarchy_id: hierarchyId,
    });
  }
};

exports.down = async function (db) {
  const WAIVIVIA_ID = await codeToId(db, 'entity', WAIVIVIA_CODE);
  const EASTERN_ID = await codeToId(db, 'entity', EASTERN_CODE);

  if (!(WAIVIVIA_ID && EASTERN_ID)) {
    throw new Error('Entities not found');
  }

  await db.runSql(`
    UPDATE entity 
    SET parent_id = '${EASTERN_ID}'
    WHERE code = '${WAIVIVIA_CODE}';

    DELETE FROM entity_relation 
    WHERE child_id = '${WAIVIVIA_ID}';
  `);
};

exports._meta = {
  version: 1,
};
