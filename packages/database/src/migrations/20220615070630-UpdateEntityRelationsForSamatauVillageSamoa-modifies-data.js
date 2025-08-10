'use strict';

import { codeToId, nameToId, updateValues } from '../utilities';

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

const CHILD_CODE = 'WS_001_Samatau';
const PARENT_CODE = 'WS_sd05';
const PROJECT_CODES = ['covid_samoa', 'penfaa_samoa'];

exports.up = async function (db) {
  const childId = await codeToId(db, 'entity', CHILD_CODE);
  const parentId = await codeToId(db, 'entity', PARENT_CODE);
  await PROJECT_CODES.forEach(async projectCode => {
    const hierarchyId = await nameToId(db, 'entity_hierarchy', projectCode);
    await updateValues(
      db,
      'entity_relation',
      { parent_id: parentId },
      { entity_hierarchy_id: hierarchyId, child_id: childId },
    );
  });
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};

// Currently the village Samatau (WS_001_Samatau) has parent sub_district Salega 1 (WS_sd41) which is incorrect. The correct parent is sub_district Aiga I le Tai (WS_sd05)

// This has been updated for the canonical hierarchy but needs to be updated for the projects covid_samoa and penfaa
