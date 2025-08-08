'use strict';

import projectsToAdd from './migrationData/20231119225952-AddNewSurveyProjects/projectsToAdd.json';
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

const createProject = async (db, project) => {
  const { name, code, permissionGroup, countryCode, description } = project;

  // create project entity
  await insertObject(db, 'entity', {
    id: generateId(),
    code,
    parent_id: await codeToId(db, 'entity', 'World'),
    name,
    type: 'project',
  });
  const entityHierarchyId = generateId();

  // create project entity hierarchy
  await insertObject(db, 'entity_hierarchy', {
    id: entityHierarchyId,
    name: code,
    canonical_types: '{}',
  });

  // create project entity relation between project and country
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', code),
    child_id: await codeToId(db, 'entity', countryCode),
    entity_hierarchy_id: entityHierarchyId,
  });

  // create project dashboard
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: `${code}_project`,
    name: 'General',
    root_entity_code: countryCode,
    sort_order: 1,
  });

  // create project entry
  await insertObject(db, 'project', {
    id: generateId(),
    code,
    description,
    sort_order: 15,
    image_url: '',
    default_measure: '126',
    permission_groups: '{Public}',
    logo_url: '',
    entity_id: await codeToId(db, 'entity', code),
    entity_hierarchy_id: entityHierarchyId,
  });
};

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record?.rows[0].id;
};

const removeProject = async (db, project) => {
  const { code } = project;
  const hierarchyId = await hierarchyNameToId(db, code);

  await db.runSql(`DELETE FROM dashboard WHERE code = '${code}_project'`);
  await db.runSql(`DELETE FROM project WHERE code = '${code}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${code}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${code}'`);
};

exports.up = function (db) {
  return Promise.all(projectsToAdd.map(project => createProject(db, project)));
};

exports.down = function (db) {
  return Promise.all(projectsToAdd.map(project => removeProject(db, project)));
};

exports._meta = {
  version: 1,
};
