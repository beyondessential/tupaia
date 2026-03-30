'use strict';

import { codeToId, deleteObject, updateValues } from '../utilities';

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

// note the invalid codes have the letter L after the G in Gilbert
const ENTITY_CODES = ['KI_Glibert Islands_Abaiang', 'KI_Glibert Islands'];
const VALID_DISTRICT_CODE = 'KI_Gilbert Islands_Abaiang';
const FACILITY_CODE = 'KI_ABRD21';

exports.up = async function (db) {
  const parentId = await codeToId(db, 'entity', VALID_DISTRICT_CODE);
  const facilityId = await codeToId(db, 'entity', FACILITY_CODE);
  await updateValues(db, 'entity', { parent_id: parentId }, { id: facilityId });

  for (const code of ENTITY_CODES) {
    const entityId = await codeToId(db, 'entity', code);
    await deleteObject(db, 'entity_relation', { child_id: entityId });
    await deleteObject(db, 'entity', { id: entityId });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
