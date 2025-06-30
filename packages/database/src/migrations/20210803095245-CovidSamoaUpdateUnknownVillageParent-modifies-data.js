'use strict';

import {
  codeToId,
  findSingleRecord,
} from '../utilities';

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

exports.up = async function (db) {
  const unknownVillageId = await codeToId(db, 'entity', 'WS_Unknown_Village');
  const unknownDistrictId = await codeToId(db, 'entity', 'WS_sdUnknown');
  const covidSamoaId = (await findSingleRecord(db, 'entity_hierarchy', { name: 'covid_samoa' })).id;

  await db.runSql(`
    update "entity" set parent_id = '${unknownDistrictId}' where code = 'WS_Unknown_Village';
    update "entity_relation" set parent_id = '${unknownDistrictId}' where child_id = '${unknownVillageId}' and entity_hierarchy_id = '${covidSamoaId}';
  `);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
