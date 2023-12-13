'use strict';

const { generateId } = require('../utilities');

var dbm;
var type;
var seed;

const getEntityIdByCode = async (db, code) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = '${code}';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Entity with code ${code} Not found`);
};

const getHierarchyIdByName = async (db, name) => {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Hierarchy with name ${name} not found`);
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const timorLesteId = await getEntityIdByCode(db, 'TL');
  await db.runSql(`
    DELETE FROM entity_relation WHERE child_id = '${timorLesteId}'
  `);
};

exports.down = async function (db) {
  const timorLesteId = await getEntityIdByCode(db, 'TL');
  const exploreEntityId = await getEntityIdByCode(db, 'explore');
  const exploreHierarchyId = await getHierarchyIdByName(db, 'explore');
  const disasterEntityId = await getEntityIdByCode(db, 'disaster');
  const disasterHierarchyId = await getHierarchyIdByName(db, 'disaster');
  await db.runSql(`
    INSERT INTO entity_relation (id, child_id, parent_id, entity_hierarchy_id)
    VALUES ('${generateId()}', '${timorLesteId}', '${exploreEntityId}', '${exploreHierarchyId}'),
           ('${generateId()}', '${timorLesteId}', '${disasterEntityId}', '${disasterHierarchyId}')
  `);
};

exports._meta = {
  version: 1,
};
