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
  const results = await db.runSql(
    `SELECT id FROM entity_hierarchy WHERE name = 'nr_public_health';`,
  );
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Nauru Public Health hierarchy not found`);
};

exports.up = async function (db) {
  const hierarchyId = await getHierarchyId(db);
  // Create canonical hierarchy for Nauru Public Health, as it is currently empty
  await db.runSql(`
    UPDATE entity_hierarchy
    SET canonical_types = array_cat(canonical_types, ARRAY['country', 'district', 'facility', 'business', 'school'])
    WHERE id = '${hierarchyId}'
  `);
};

exports.down = async function (db) {
  const hierarchyId = await getHierarchyId(db);
  // revert to empty canonical hierarchy
  await db.runSql(`
    UPDATE entity_hierarchy
    SET canonical_types = '{}'
    WHERE id = '${hierarchyId}'
  `);
};
exports._meta = {
  version: 1,
};
