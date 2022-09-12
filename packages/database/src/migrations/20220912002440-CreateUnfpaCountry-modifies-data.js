'use strict';

const { insertObject, generateId, nameToId, codeToId } = require('../utilities');

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

const NEW_COUNTRY_ENTITY_NAME = 'UNFPA Warehouse';
const NEW_COUNTRY_ENTITY_CODE = 'UW'; // Made up country code "Unfpa Warehouse" = "UW"

exports.up = async function (db) {
  await insertObject(db, 'country', {
    id: generateId(),
    name: NEW_COUNTRY_ENTITY_NAME,
    code: NEW_COUNTRY_ENTITY_CODE,
  });
  const worldEntityId = await codeToId(db, 'entity', 'World');
  const newEntityId = generateId();
  await insertObject(db, 'entity', {
    id: newEntityId,
    code: NEW_COUNTRY_ENTITY_CODE,
    parent_id: worldEntityId,
    name: NEW_COUNTRY_ENTITY_NAME,
    type: 'country',
    country_code: NEW_COUNTRY_ENTITY_CODE,
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

exports.down = async function (db) {
  db.runSql(`DELETE FROM country WHERE code = '${NEW_COUNTRY_ENTITY_CODE}'`);
  const entityId = await codeToId(db, 'entity', NEW_COUNTRY_ENTITY_CODE);
  db.runSql(`DELETE FROM entity_relation WHERE child_id = '${entityId}'`);
  db.runSql(`DELETE FROM entity WHERE id = '${entityId}'`);
};

exports._meta = {
  version: 1,
};
