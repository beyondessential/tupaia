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

const getLaosEntityHierarchyId = async db => {
  const hierarchy = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'laos_eoc'`);
  return hierarchy.rows[0].id;
};

const getLaosCountryId = async db => {
  const country = await db.runSql(`SELECT id FROM entity WHERE code = 'LA'`);
  return country.rows[0].id;
};

exports.up = async function (db) {
  const laosCountryId = await getLaosCountryId(db);
  const laosEntityHierarchyId = await getLaosEntityHierarchyId(db);

  await db.runSql(`
    DELETE FROM entity_relation 
    WHERE entity_hierarchy_id = '${laosEntityHierarchyId}' 
    AND child_id <> '${laosCountryId}';
  `);

  await db.runSql(`
    UPDATE entity_hierarchy 
    SET canonical_types = '{country,district,sub_district,city,facility}' 
    WHERE id = '${laosEntityHierarchyId}';
  `);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
