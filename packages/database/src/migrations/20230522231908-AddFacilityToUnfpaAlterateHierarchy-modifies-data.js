'use strict';

import { codeToId, insertObject, generateId, deleteObject, nameToId } from '../utilities';

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

const FACILITY_CODE = 'FM_088';
const DISTRICT_CODE = 'FM_Pohnpei';
const PROJECT_CODE = 'unfpa';
const ENTITY_TABLE = 'entity';
const ENTITY_RELATION_TABLE = 'entity_relation';
const ENTITY_HIERARCHY_TABLE = 'entity_hierarchy';

exports.up = async function (db) {
  const facilityId = await codeToId(db, ENTITY_TABLE, FACILITY_CODE);
  const districtId = await codeToId(db, ENTITY_TABLE, DISTRICT_CODE);
  const hierarchyId = await nameToId(db, ENTITY_HIERARCHY_TABLE, PROJECT_CODE);

  await insertObject(db, ENTITY_RELATION_TABLE, {
    id: generateId(),
    parent_id: districtId,
    child_id: facilityId,
    entity_hierarchy_id: hierarchyId,
  });
};

exports.down = async function (db) {
  const facilityId = await codeToId(db, ENTITY_TABLE, FACILITY_CODE);
  const hierarchyId = await nameToId(db, ENTITY_HIERARCHY_TABLE, PROJECT_CODE);

  await deleteObject(db, ENTITY_RELATION_TABLE, {
    child_id: facilityId,
    entity_hierarchy_id: hierarchyId,
  });
};

exports._meta = {
  version: 1,
};
