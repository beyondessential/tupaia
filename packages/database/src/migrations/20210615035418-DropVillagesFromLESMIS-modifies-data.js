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

const getHierarchyId = async (db, name) => {
  const { rows: data } = await db.runSql(`
    SELECT id FROM entity_hierarchy
    WHERE name = '${name}'
  `);
  return data[0]?.id;
};

exports.up = async function (db) {
  const hierarchy = await getHierarchyId(db, 'laos_schools');
  await db.runSql(`
  UPDATE entity_hierarchy
  SET canonical_types = array_remove(canonical_types, 'village')
  WHERE name = 'laos_schools'
  `);
  await db.runSql(`
  DELETE FROM entity_relation
  WHERE id IN
    (
      SELECT er.id FROM entity_relation er
      INNER JOIN entity parent
      ON parent.id = er.parent_id
      INNER JOIN entity child
      ON child.id = er.child_id
      WHERE entity_hierarchy_id = '${hierarchy}'
      AND (parent.type = 'village' OR child.type = 'village')
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`
  UPDATE entity_hierarchy
  SET canonical_types = array_append(canonical_types, 'village')
  WHERE name = 'laos_schools'
  `);
};

exports._meta = {
  version: 1,
};
