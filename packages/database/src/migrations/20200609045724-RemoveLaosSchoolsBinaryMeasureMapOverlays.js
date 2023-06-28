import { arrayToDbString } from '../utilities';

('use strict');

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

const LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS = [
  'Laos_Schools_Schools_Received_Learning_Materials',
  'Laos_Schools_Schools_Provided_With_Cleaning_Materials',
  'Laos_Schools_Schools_Provided_With_Hygiene_Kits',
  'Laos_Schools_Schools_Received_Training_On_Safe_Protocols',
  'Laos_Schools_Schools_Provided_With_Psychosocial_Support',
];

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS)});
  `);
};

exports.down = function (db) {
  // No down migration;
  return null;
};

exports._meta = {
  version: 1,
};
