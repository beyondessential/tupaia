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
    countryCode: 'UW',
    parentCode: 'UNFPA PSRO SUB_DISTRICT',
  },
  {
    code: 'FPBS',
    name: 'Fiji Pharmaceutical and Biomedical Services Warehouse',
    countryCode: 'FW',
    parentCode: 'UNFPA FPBS SUB_DISTRICT',
  },
];

const NEW_DISTRICTS = [
  {
    code: 'UNFPA PSRO DISTRICT',
    name: 'UNFPA PSRO DISTRICT',
    parentCode: 'UW',
  },
  {
    code: 'UNFPA FPBS DISTRICT',
    name: 'UNFPA FPBS DISTRICT',
    parentCode: 'FW',
  },
];

const NEW_SUB_DISTRICTS = [
  {
    code: 'UNFPA PSRO SUB_DISTRICT',
    name: 'UNFPA PSRO SUB_DISTRICT',
    countryCode: 'UW',
    parentCode: 'UNFPA PSRO DISTRICT',
  },
  {
    code: 'UNFPA FPBS SUB_DISTRICT',
    name: 'UNFPA FPBS SUB_DISTRICT',
    countryCode: 'FW',
    parentCode: 'UNFPA FPBS DISTRICT',
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

const createFacility = async (db, { code, name, countryCode, parentCode }) => {
  const parentId = await codeToId(db, 'entity', parentCode);
  const unfpaHierarchyId = await nameToId(db, 'entity_hierarchy', 'unfpa');

  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code,
    name,
    parent_id: parentId,
    type: 'facility',
    country_code: countryCode,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: parentId,
    child_id: newEntityId,
    entity_hierarchy_id: unfpaHierarchyId,
  });
};

const createSubDistrict = async (db, { code, name, countryCode, parentCode }) => {
  const parentId = await codeToId(db, 'entity', parentCode);
  const unfpaHierarchyId = await nameToId(db, 'entity_hierarchy', 'unfpa');

  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code,
    name,
    parent_id: parentId,
    type: 'sub_district',
    country_code: countryCode,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: parentId,
    child_id: newEntityId,
    entity_hierarchy_id: unfpaHierarchyId,
  });
};

// Do not need to be added to entity_relation, as not for other countries' districts
const createDistrict = async (db, { code, name, parentCode }) => {
  const parentId = await codeToId(db, 'entity', parentCode);

  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code,
    name,
    parent_id: parentId,
    type: 'district',
    country_code: parentCode,
  });
};

const rollbackCreateCountry = async (db, code) => {
  db.runSql(`DELETE FROM country WHERE code = '${code}'`);
  const entityId = await codeToId(db, 'entity', code);
  db.runSql(`DELETE FROM entity_relation WHERE child_id = '${entityId}'`);
  db.runSql(`DELETE FROM entity WHERE id = '${entityId}'`);
};

const rollbackCreateEntities = async (db, code) => {
  const entityId = await codeToId(db, 'entity', code);
  await db.runSql(`DELETE FROM entity_relation WHERE child_id = '${entityId}'`);
  await db.runSql(`DELETE FROM entity WHERE id = '${entityId}'`);
};

exports.up = async function (db) {
  for (const newCountry of NEW_COUNTRIES) {
    await createCountry(db, newCountry);
  }
  for (const newDistrict of NEW_DISTRICTS) {
    await createDistrict(db, newDistrict);
  }
  for (const newSubDistrict of NEW_SUB_DISTRICTS) {
    await createSubDistrict(db, newSubDistrict);
  }
  for (const newFacility of NEW_FACILITIES) {
    await createFacility(db, newFacility);
  }
};

exports.down = async function (db) {
  for (const newFacility of NEW_FACILITIES) {
    await rollbackCreateEntities(db, newFacility.code);
  }
  for (const newSubDistrict of NEW_SUB_DISTRICTS) {
    await rollbackCreateEntities(db, newSubDistrict.code);
  }
  for (const newDistrict of NEW_DISTRICTS) {
    await rollbackCreateEntities(db, newDistrict.code);
  }
  for (const newCountry of NEW_COUNTRIES) {
    await rollbackCreateCountry(db, newCountry.code);
  }
};

exports._meta = {
  version: 1,
};
