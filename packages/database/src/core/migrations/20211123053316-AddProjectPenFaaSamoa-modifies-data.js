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

const COUNTRY_CODE = 'WS';
const PROJECT_CODE = 'penfaa_samoa';
const DASHBOARD_PROJECT_NAME = "PEN Fa'a Samoa";
const DASHBOARD_PROJECT_CODE = 'ncd_ws_penfaa_samoa_project';
const DASHBOARD_COUNTRY_CODE = 'ncd_ws_penfaa_samoa_country';
const PERMISSION_GROUP = 'Donor';

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  await insertObject(db, 'entity', {
    id: generateId(),
    code: PROJECT_CODE,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: DASHBOARD_PROJECT_NAME,
    type: 'project',
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', COUNTRY_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_PROJECT_CODE,
    name: DASHBOARD_PROJECT_NAME,
    root_entity_code: PROJECT_CODE,
  });
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_COUNTRY_CODE,
    name: DASHBOARD_PROJECT_NAME,
    root_entity_code: COUNTRY_CODE,
  });
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: await codeToId(db, 'dashboard', DASHBOARD_PROJECT_CODE),
    child_id: await codeToId(db, 'dashboard_item', 'project_details'),
    entity_types: '{project}',
    project_codes: `{${PROJECT_CODE}}`,
    permission_groups: `{${PERMISSION_GROUP}}`,
    sort_order: 0,
  });
  await insertObject(db, 'project', {
    id: generateId(),
    code: PROJECT_CODE,
    description: "NCD Data for Samoa from the PEN Fa'a Project",
    sort_order: 15,
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/penfaa_samoa_background.png',
    default_measure: '126',
    dashboard_group_name: DASHBOARD_PROJECT_NAME,
    permission_groups: `{${PERMISSION_GROUP}}`,
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/penfaa_samoa_logo.png',
    entity_id: await codeToId(db, 'entity', PROJECT_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, PROJECT_CODE);

  await db.runSql(
    `DELETE FROM "dashboard" WHERE code IN ('${DASHBOARD_PROJECT_CODE}', '${DASHBOARD_COUNTRY_CODE}')`,
  );
  await db.runSql(`DELETE FROM project WHERE code = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${PROJECT_CODE}'`);
};

exports._meta = {
  version: 1,
};
