'use strict';

const { insertObject, generateId, codeToId, nameToId } = require('../utilities');

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

const NEW_COUNTRIES = [
  {
    name: 'UNFPA Warehouse',
    code: 'UW', // Made up country code "Unfpa Warehouse" = "UW"
  },
  {
    name: 'FPBS Warehouse',
    code: 'FW', // Made up country code "FPBS Warehouse" = "UW"
  },
];

const NEW_FACILITIES = [
  {
    code: 'UNFPA PSRO Warehouse',
    name: 'UNFPA PSRO Warehouse',
    parentCode: 'UW',
  },
  {
    code: 'FPBS',
    name: 'Fiji Pharmaceutical and Biomedical Services Warehouse',
    parentCode: 'FW',
  },
];

const createCountry = async (db, { code, name }) => {
  await insertObject(db, 'country', {
    id: generateId(),
    name,
    code,
  });
  const worldEntityId = await codeToId(db, 'entity', 'World');
  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code,
    parent_id: worldEntityId,
    name,
    type: 'country',
    country_code: code,
  });
  const unfpaHierarchyId = await nameToId(db, 'entity_hierarchy', 'unfpa');
  const unfpaProjectEntityId = await codeToId(db, 'entity', 'unfpa');
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: unfpaProjectEntityId,
    child_id: newEntityId,
    entity_hierarchy_id: unfpaHierarchyId,
  });
};

const createFacility = async (db, { code, name, parentCode }) => {
  const parentId = await codeToId(db, 'entity', parentCode);
  const unfpaHierarchyId = await nameToId(db, 'entity_hierarchy', 'unfpa');

  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code,
    name,
    parent_id: parentId,
    type: 'facility',
    country_code: 'FW',
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: parentId,
    child_id: newEntityId,
    entity_hierarchy_id: unfpaHierarchyId,
  });
};

const rollbackCreateCountry = async (db, code) => {
  db.runSql(`DELETE FROM country WHERE code = '${code}'`);
  const entityId = await codeToId(db, 'entity', code);
  db.runSql(`DELETE FROM entity_relation WHERE child_id = '${entityId}'`);
  db.runSql(`DELETE FROM entity WHERE id = '${entityId}'`);
};

const rollbackCreateFacility = async (db, code) => {
  const entityId = await codeToId(db, 'entity', code);
  await db.runSql(`DELETE FROM entity_relation WHERE child_id = '${entityId}'`);
  await db.runSql(`DELETE FROM entity WHERE id = '${entityId}'`);
};

exports.up = async function (db) {
  for (const newCountry of NEW_COUNTRIES) {
    await createCountry(db, newCountry);
  }
  for (const newFacility of NEW_FACILITIES) {
    await createFacility(db, newFacility);
  }
};

exports.down = async function (db) {
  for (const newFacility of NEW_FACILITIES) {
    await rollbackCreateFacility(db, newFacility.code);
  }
  for (const newCountry of NEW_COUNTRIES) {
    await rollbackCreateCountry(db, newCountry.code);
  }
};

exports._meta = {
  version: 1,
};
