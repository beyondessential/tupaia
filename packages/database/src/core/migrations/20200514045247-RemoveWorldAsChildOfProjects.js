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

const getWorldId = async db => db.runSql(`select id from entity where code = 'World' limit 1;`);
const getCountryAndDisasterIds = async db =>
  db.runSql(`select id from entity where type = 'disaster' or type = 'country';`);
const getDisasterHierarchyId = async db =>
  db.runSql(`select id from entity_hierarchy where name = 'disaster' limit 1;`);
const getDisasterEntityId = async db =>
  db.runSql(`select id from entity where code = 'disaster' limit 1;`);

exports.up = async function (db) {
  const worldId = (await getWorldId(db)).rows[0].id;
  const disasterHierarchyId = (await getDisasterHierarchyId(db)).rows[0].id;
  const disasterEntityId = (await getDisasterEntityId(db)).rows[0].id;
  const countryAndDisasterIds = (await getCountryAndDisasterIds(db)).rows.map(entity => entity.id);
  const values = countryAndDisasterIds
    .map(
      entityId =>
        `('${generateId()}', '${disasterEntityId}', '${entityId}', '${disasterHierarchyId}')`,
    )
    .join();
  return db.runSql(`
      DELETE FROM entity_relation
      WHERE child_id = '${worldId}';

      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      VALUES ${values};
  `);
};

exports.down = async function (db) {
  const worldId = (await getWorldId(db)).rows[0].id;
  const disasterHierarchyId = (await getDisasterHierarchyId(db)).rows[0].id;
  const disasterEntityId = (await getDisasterEntityId(db)).rows[0].id;
  return db.runSql(`
      DELETE FROM entity_relation
      WHERE parent_id = '${disasterEntityId}';

      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      VALUES ('${generateId()}', '${disasterEntityId}', '${worldId}', '${disasterHierarchyId}');
`);
};

exports._meta = {
  version: 1,
};
