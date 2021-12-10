('use strict');

import { generateId, codeToId, insertObject, deleteObject, updateValues } from '../utilities';

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

const PROJECT_CODE = 'flutracking';
const COUNTRY_CODE = 'AU';
const COVID_CODE = 'covidau';
const COVID_PROJECT_UPDATED_NAME = 'COVID-19 Australia';
const COVID_PROJECT_CURRENT_NAME = 'FluTracking & COVID-19 Australia';

const FLUTRACKING_ENTITY = {
  code: PROJECT_CODE,
  name: 'FluTracking',
  type: 'project',
};

const FLUTRACKING_PROJECT = {
  id: generateId(),
  code: PROJECT_CODE,
  description: 'Online health surveillance system used to detect the potential spread of influenza',
  sort_order: 1,
  image_url:
    'https://tupaia.s3.ap-southeast-2.amazonaws.com/thumbnails/uploads/flu_tracking_project_image.png',
  default_measure: 'AU_FLUTRACKING_LGA_Fever_And_Cough',
  dashboard_group_name: 'FluTracking',
  permission_groups: `{FluTracking Public}`,
  logo_url:
    'https://tupaia.s3.ap-southeast-2.amazonaws.com/thumbnails/uploads/flu_tracking_logo.png',
};

exports.up = async function (db) {
  const entityHierarchyId = generateId();
  await insertObject(db, 'entity_hierarchy', {
    id: entityHierarchyId,
    name: PROJECT_CODE,
    canonical_types: '{country,district,sub_district,postcode}',
  });
  const flutrackingEntityId = generateId();
  await insertObject(db, 'entity', {
    id: flutrackingEntityId,
    parent_id: await codeToId(db, 'entity', 'World'),
    ...FLUTRACKING_ENTITY,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: flutrackingEntityId,
    child_id: await codeToId(db, 'entity', COUNTRY_CODE),
    entity_hierarchy_id: entityHierarchyId,
  });
  await insertObject(db, 'project', {
    entity_id: flutrackingEntityId,
    entity_hierarchy_id: entityHierarchyId,
    ...FLUTRACKING_PROJECT,
  });
  await updateValues(db, 'entity', { name: COVID_PROJECT_UPDATED_NAME }, { code: COVID_CODE });
};

exports.down = async function (db) {
  await deleteObject(db, 'project', { code: PROJECT_CODE });
  const flutrackingEntityId = await codeToId(db, 'entity', PROJECT_CODE);
  await deleteObject(db, 'entity_relation', { parent_id: flutrackingEntityId });
  await deleteObject(db, 'entity', { code: PROJECT_CODE });
  await deleteObject(db, 'entity_hierarchy', { name: PROJECT_CODE });
  await updateValues(db, 'entity', { name: COVID_PROJECT_CURRENT_NAME }, { code: COVID_CODE });
};

exports._meta = {
  version: 1,
};
