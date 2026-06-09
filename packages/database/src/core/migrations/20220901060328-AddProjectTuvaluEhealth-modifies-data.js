'use strict';

import { insertObject, codeToId, generateId } from '../utilities';

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

const PROJECT_NAME = 'Tuvalu eHealth';
const PROJECT_CODE = 'ehealth_tuvalu';
const DASHBOARD_CODE = 'TV_COVID-19';
const DASHBOARD_NAME = 'COVID-19 Vaccination';
const PROJECT = {
  code: PROJECT_CODE,
  description: 'Aggregate health data for Tuvalu',
  sort_order: 8,
  image_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/tuvalu-ehealth-image.png',
  default_measure: '126',
  dashboard_group_name: DASHBOARD_NAME,
  permission_groups: '{Tuvalu eHealth Admin,Tuvalu eHealth,Tuvalu COVID-19}',
  logo_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/uploads/tuvalu-ehealth-logo.png',
};
const ENTITY = {
  code: PROJECT_CODE,
  name: PROJECT_NAME,
  type: 'project',
};

const addDashboard = async db => {
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: DASHBOARD_NAME,
    root_entity_code: PROJECT_CODE,
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
    canonical_types: '{country,district,village}',
  });
};

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const addEntityRelation = async db => {
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', 'TV'),
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
  await addEntityHierarchy(db);
  await addEntityRelation(db);
  await addProject(db);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
