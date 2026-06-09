'use strict';

import { generateId } from '../utilities';

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

const PROJECT_CODE = 'explore';
const getExploreHierarchyId = async db =>
  db.runSql(`select id from entity_hierarchy where name = '${PROJECT_CODE}' limit 1;`);
const getExploreEntityId = async db =>
  db.runSql(`select id from entity where code = '${PROJECT_CODE}' limit 1;`);
const getCountryIds = async db => db.runSql(`select id from entity where type = 'country';`);
const getWorldBounds = async db =>
  db.runSql(`select bounds from entity where code = 'World' limit 1;`);

exports.up = async function (db) {
  /** Updating project entity relations */
  const exploreHierarchyId = (await getExploreHierarchyId(db)).rows[0].id;
  const exploreEntityId = (await getExploreEntityId(db)).rows[0].id;
  const countryIds = (await getCountryIds(db)).rows.map(row => row.id);
  const values = countryIds
    .map(
      countryId =>
        `('${generateId()}', '${exploreEntityId}', '${countryId}', '${exploreHierarchyId}')`,
    )
    .join();

  const worldBounds = (await getWorldBounds(db)).rows[0].bounds;
  return db.runSql(`
      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      VALUES ${values};

      UPDATE entity
      SET bounds = '${worldBounds}'
      WHERE type = 'project';

      UPDATE entity
      SET name = 'Explore'
      WHERE code = '${PROJECT_CODE}';
    `);
};

exports.down = async function (db) {
  /** Updating project entity relations */
  const exploreHierarchyId = (await getExploreHierarchyId(db)).rows[0].id;
  const exploreEntityId = (await getExploreEntityId(db)).rows[0].id;
  const countryIds = (await getCountryIds(db)).rows.map(row => row.id);
  const clauses = countryIds
    .map(
      countryId =>
        `(parent_id = '${exploreEntityId}' AND child_id = '${countryId}' AND entity_hierarchy_id = '${exploreHierarchyId}')`,
    )
    .join(' OR ');
  return db.runSql(`
      DELETE FROM entity_relation
      WHERE ${clauses};

      UPDATE entity
      SET bounds = NULL
      WHERE type = 'project';

      UPDATE entity
      SET name = 'General'
      WHERE code = '${PROJECT_CODE}';
    `);
};

exports._meta = {
  version: 1,
};
