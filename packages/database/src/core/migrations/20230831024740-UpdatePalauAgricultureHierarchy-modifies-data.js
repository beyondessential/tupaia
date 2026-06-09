'use strict';

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

const getHierarchyId = async db => {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'palau_ag';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Palau agriculture hierarchy not found`);
};

const getEntityIdByCode = async (db, code) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = '${code}';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Entity with code ${code} Not found`);
};

exports.up = async function (db) {
  const hierarchyId = await getHierarchyId(db);
  // Add farm to canonical_types for palau agriculture
  await db.runSql(`
    UPDATE entity_hierarchy
    SET canonical_types = array_append(canonical_types, 'farm')
    WHERE id = '${hierarchyId}'
  `);
  // Add district -> sub_district to alternative hierarchy
  // Canonical hierarchy is district -> facility -> sub_district
  // So we can just insert relations skipping the middle entity
  // i.e. entity->parent_id->parent_id
  await db.runSql(`
    INSERT INTO entity_relation (id, child_id, parent_id, entity_hierarchy_id)
    SELECT
      generate_object_id() as id,
      entity.id as child_id,
      parent.parent_id as parent_id,
      '${hierarchyId}' as entity_hierarchy_id
    FROM entity INNER JOIN entity parent
    ON parent.id = entity.parent_id
    WHERE entity.country_code = 'PW'
    AND entity.type = 'sub_district'
  `);
};

exports.down = async function (db) {
  const hierarchyId = await getHierarchyId(db);
  const entityIdPalauAgriculture = await getEntityIdByCode(db, 'palau_ag');
  // Remove district -> sub_district alternative hierarchy
  // Prior to this migration there was only one existing record
  // Connecting project -> palau, so just ignore that one
  await db.runSql(`
    DELETE FROM entity_relation
    WHERE entity_hierarchy_id = '${hierarchyId}'
    AND parent_id <> '${entityIdPalauAgriculture}'
  `);
  // Remove farm from canonical_types
  await db.runSql(`
    UPDATE entity_hierarchy
    SET canonical_types = array_remove(canonical_types, 'farm')
    WHERE name = 'palau_ag'
  `);
};

exports._meta = {
  version: 1,
};
