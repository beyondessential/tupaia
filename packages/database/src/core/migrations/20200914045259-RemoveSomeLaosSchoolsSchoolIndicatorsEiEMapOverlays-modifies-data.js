'use strict';

import { arrayToDbString } from '../utilities';

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

const MAP_OVERLAY_IDS = [
  'Laos_Schools_Dormitory_Schools',
  'Laos_Schools_Students_Required_Psychosocial_SUpport',
  'Laos_Schools_Textbook_Additional_Learning_Material',
  'Laos_Schools_Teachers_Using_Resources_On_MoES_Website',
  'Laos_Schools_Functioning_Toilet',
  'Laos_Schools_Internet_Connection_Available_In_School',
  'Laos_Schools_Functioning_Water_Filters',
  'Laos_Schools_Telephone_Available',
];
exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay"
    WHERE id IN (${arrayToDbString(MAP_OVERLAY_IDS)});

    DELETE FROM map_overlay_group_relation
    WHERE child_id IN (${arrayToDbString(MAP_OVERLAY_IDS)});
  `);
};

exports.down = function (db) {
  // No migration down
  return null;
};

exports._meta = {
  version: 1,
};
