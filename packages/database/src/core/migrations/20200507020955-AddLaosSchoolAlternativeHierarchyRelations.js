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

const COUNTRY_CODE = 'LA';
const PROJECT_CODE = 'laos_schools';
const getLaosSchoolsHierarchyId = async db =>
  db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${PROJECT_CODE}' LIMIT 1;`);
const getSubDistrictAndSchoolIdsAndParentIds = async db =>
  db.runSql(
    `SELECT id, parent_id FROM entity WHERE (type = 'sub_district' OR type = 'school') AND country_code = '${COUNTRY_CODE}';`,
  );

exports.up = async function (db) {
  /** Updating project entity relations */
  const laosSchoolsHierarchyId = (await getLaosSchoolsHierarchyId(db)).rows[0].id;
  const subDistrictAndSchools = (await getSubDistrictAndSchoolIdsAndParentIds(db)).rows;
  const values = subDistrictAndSchools
    .map(
      ({ id, parent_id }) =>
        `('${generateId()}', '${parent_id}', '${id}', '${laosSchoolsHierarchyId}')`,
    )
    .join();

  return db.runSql(`
      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      VALUES ${values};
    `);
};

exports.down = async function (db) {
  /** Updating project entity relations */
  const laosSchoolsHierarchyId = (await getLaosSchoolsHierarchyId(db)).rows[0].id;
  const subDistrictAndSchools = (await getSubDistrictAndSchoolIdsAndParentIds(db)).rows;
  const clauses = subDistrictAndSchools
    .map(
      ({ id, parent_id }) =>
        `(parent_id = '${parent_id}' AND child_id = '${id}' AND entity_hierarchy_id = '${laosSchoolsHierarchyId}')`,
    )
    .join(' OR ');
  return db.runSql(`
      DELETE FROM entity_relation
      WHERE ${clauses};
    `);
};

exports._meta = {
  version: 1,
};
