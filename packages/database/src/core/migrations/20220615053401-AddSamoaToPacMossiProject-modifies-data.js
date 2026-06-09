'use strict';

import { codeToId, deleteObject, generateId, insertObject, nameToId } from '../utilities';

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

const ENTITY_CODE = 'WS';
const PROJECT_CODE = 'pacmossi';

exports.up = async function (db) {
  const childId = await codeToId(db, 'entity', ENTITY_CODE);
  const parentId = await codeToId(db, 'entity', PROJECT_CODE);
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);

  return insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: parentId,
    child_id: childId,
    entity_hierarchy_id: hierarchyId,
  });
};

exports.down = async function (db) {
  const childId = await codeToId(db, 'entity', ENTITY_CODE);
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);

  return deleteObject(db, 'entity_relation', {
    child_id: childId,
    entity_hierarchy_id: hierarchyId,
  });
};

exports._meta = {
  version: 1,
};
