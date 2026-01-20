'use strict';

import { insertObject, generateId, findSingleRecord } from '../utilities';

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

const villages = [
  { code: 'WS_v001', parentCode: 'WS_sd05' },
  { code: 'WS_v002', parentCode: 'WS_sd05' },
  { code: 'WS_v003', parentCode: 'WS_sd11' },
  { code: 'WS_v004', parentCode: 'WS_sd14' },
  { code: 'WS_v005', parentCode: 'WS_sd40' },
];

exports.up = async function (db) {
  const covidSamoaHierarchyId = (
    await findSingleRecord(db, 'entity_hierarchy', { name: 'covid_samoa' })
  ).id;
  return Promise.all(
    villages.map(async village => {
      const villageId = (await findSingleRecord(db, 'entity', { code: village.code })).id;
      const parentId = (await findSingleRecord(db, 'entity', { code: village.parentCode })).id;
      return insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: parentId,
        child_id: villageId,
        entity_hierarchy_id: covidSamoaHierarchyId,
      });
    }),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
