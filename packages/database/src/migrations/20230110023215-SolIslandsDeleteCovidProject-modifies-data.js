'use strict';

import { codeToId, deleteObject, nameToId } from '../utilities';

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

const PROJECT_CODE = 'covid_solomon';

exports.up = async function (db) {
  const projectId = await codeToId(db, 'project', PROJECT_CODE);
  await deleteObject(db, 'access_request', { project_id: projectId });
  await deleteObject(db, 'project', { id: projectId });
  await deleteObject(db, 'dashboard', { root_entity_code: PROJECT_CODE });
  const entityHierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  await deleteObject(db, 'entity_relation', { entity_hierarchy_id: entityHierarchyId });
  await deleteObject(db, 'entity_hierarchy', { name: PROJECT_CODE });
  await deleteObject(db, 'entity', { code: PROJECT_CODE, type: 'project' });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
