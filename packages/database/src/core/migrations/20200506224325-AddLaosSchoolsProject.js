'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

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

const PROJECT_CODE = 'laos_schools';

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const getWorldBounds = async db =>
  db.runSql(`select bounds from entity where code = 'World' limit 1;`);

exports.up = async function (db) {
  await insertObject(db, 'entity', {
    id: generateId(),
    code: PROJECT_CODE,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: 'Laos Schools',
    type: 'project',
    bounds: (await getWorldBounds(db)).rows[0].bounds,
  });
  await insertObject(db, 'entity_hierarchy', {
    id: generateId(),
    name: PROJECT_CODE,
  });
  await insertObject(db, 'project', {
    id: generateId(),
    code: PROJECT_CODE,
    description: 'Map of education system in Laos, supporting COVID-19 response',
    sort_order: 6,
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/laos_schools_background.jpg',
    default_measure: '126,171',
    dashboard_group_name: 'General',
    user_groups: '{Laos Schools User}',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/laos_schools_logo.png',
    entity_id: await codeToId(db, 'entity', PROJECT_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', 'LA'),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, PROJECT_CODE);

  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM project WHERE code = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${PROJECT_CODE}'`);
};

exports._meta = {
  version: 1,
};
