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

const PROJECT_NAME = 'Mass Drug Administration';
const PROJECT_CODE = 'mass_drug_admin';
const DASHBOARD_CODE = 'mass_drug_admin';
const DASHBOARD_NAME = 'MDA';
const MAP_OVERLAY_GROUP_CODE = 'mass_drug_admin';
const MAP_OVERLAY_GROUP_NAME = 'MDA';
const PROJECT = {
  code: PROJECT_CODE,
  description:
    'Elimination and control of Lymphatic filariasis, Scabies and Soil-Transmitted Helminths',
  sort_order: 17,
  image_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/mass_drug_admin_image.jpeg',
  default_measure: '126,171',
  dashboard_group_name: DASHBOARD_NAME,
  permission_groups: '{MDA Admin,MDA User,MDA Data Entry}',
  logo_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/mass_drug_admin_logo.jpeg',
};
const ENTITY = {
  code: PROJECT_CODE,
  name: PROJECT_NAME,
  type: 'project',
};
const PERMISSION_GROUPS = [
  {
    name: 'MDA Admin',
    parentName: 'BES Data Admin',
  },
  {
    name: 'MDA User',
    parentName: 'MDA Admin',
  },
  {
    name: 'MDA Data Entry',
    parentName: 'MDA User',
  },
];

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
    canonical_types: '{country,district,sub_district,medical_area,nursing_zone,catchment}',
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
    child_id: await codeToId(db, 'entity', 'FJ'),
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

const addPermissionGroup = async (db, permissionGroup) => {
  const parentId = await nameToId(db, 'permission_group', permissionGroup.parentName);
  return insertObject(db, 'permission_group', {
    id: generateId(),
    name: permissionGroup.name,
    parent_id: parentId,
  });
};

exports.up = async function (db) {
  await addEntity(db);
  await addDashboard(db);
  await addMapOverlayGroup(db);
  await addEntityHierarchy(db);
  await addEntityRelation(db);
  await addProject(db);
  for (const group of PERMISSION_GROUPS) {
    await addPermissionGroup(db, group);
  }
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
  const permissionGroupsAsArray = PERMISSION_GROUPS.map(g => g.name);
  await db.runSql(
    `DELETE FROM permission_group WHERE name IN (${arrayToDbString(permissionGroupsAsArray)})`,
  );
};

exports._meta = {
  version: 1,
};
