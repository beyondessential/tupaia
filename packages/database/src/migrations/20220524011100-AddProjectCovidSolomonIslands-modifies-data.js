'use strict';

import { insertObject, codeToId, generateId, nameToId, arrayToDbString } from '../utilities';

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

const PROJECT_NAME = 'Solomon Islands COVID-19';
const PROJECT_CODE = 'covid_solomon';
const DASHBOARD_CODE = 'covid_case_data';
const DASHBOARD_NAME = 'COVID-19 Case Data';
const MAP_OVERLAY_GROUP_CODE = 'covid_case_data';
const MAP_OVERLAY_GROUP_NAME = 'COVID-19 Case Data';
const PROJECT = {
  code: PROJECT_CODE,
  description: 'COVID-19 Monitoring in Solomon Islands',
  sort_order: 6,
  image_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/covid_solomon_image.jpeg',
  default_measure: '126,171',
  dashboard_group_name: DASHBOARD_NAME,
  permission_groups: '{COVID-19 Solomon Islands,COVID-19 Solomon Islands Admin}',
  logo_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/covid_solomon_logo.jpeg',
};
const ENTITY = {
  code: PROJECT_CODE,
  name: PROJECT_NAME,
  type: 'project',
};
const projectConfig = {
  frontendExcludedTypes: ['individual'],
};

const addDashboard = async db => {
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: DASHBOARD_NAME,
    root_entity_code: PROJECT_CODE,
  });
};

const addMapOverlayGroup = async db => {
  await insertObject(db, 'map_overlay_group', {
    id: generateId(),
    code: MAP_OVERLAY_GROUP_CODE,
    name: MAP_OVERLAY_GROUP_NAME,
  });

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'Root');
  const childId = await codeToId(db, 'map_overlay_group', MAP_OVERLAY_GROUP_CODE);

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: childId,
    child_type: 'mapOverlayGroup',
  });
};

const addEntity = async db => {
  const id = generateId();
  const parentId = await codeToId(db, 'entity', 'World');
  await insertObject(db, 'entity', {
    id,
    parent_id: parentId,
    ...ENTITY,
  });
};

const addEntityHierarchy = async db => {
  await insertObject(db, 'entity_hierarchy', {
    id: generateId(),
    name: PROJECT_CODE,
    canonical_types: '{country,individual}',
  });
};

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const addEntityRelation = async db => {
  insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', 'SB'),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

const addProject = async db => {
  await insertObject(db, 'project', {
    id: generateId(),
    entity_id: await codeToId(db, 'entity', PROJECT_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
    ...PROJECT,
  });
};

exports.up = async function (db) {
  await addEntity(db);
  await addDashboard(db);
  await addMapOverlayGroup(db);
  await addEntityHierarchy(db);
  await addEntityRelation(db);
  await addProject(db);
  return db.runSql(`
    update "project" 
    set "config" = "config"::jsonb || '${JSON.stringify(projectConfig)}'::jsonb
    where "code" = '${PROJECT_CODE}'
  `);
};

exports.down = async function (db) {
  const childId = await codeToId(db, 'map_overlay_group', MAP_OVERLAY_GROUP_CODE);
  const hierarchyId = await hierarchyNameToId(db, PROJECT_CODE);

  await db.runSql(`DELETE FROM "dashboard" WHERE code = '${DASHBOARD_CODE}'`);
  await db.runSql(`DELETE FROM "map_overlay_group_relation" WHERE child_id = '${childId}'`);
  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${MAP_OVERLAY_GROUP_CODE}'`);
  await db.runSql(`DELETE FROM project WHERE code = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${PROJECT_CODE}'`);
  return db.runSql(`
    update "project" 
    set "config" = "config"::jsonb #- '{frontend_excluded_types}'
    where "code" = '${PROJECT_CODE}'
  `);
};

exports._meta = {
  version: 1,
};
