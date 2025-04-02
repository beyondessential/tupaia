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

const OVERLAYS = [
  'Laos_Schools_Toilet_District',
  'Laos_Schools_Toilet_Province',
  'Laos_Schools_Internet_Province',
  'Laos_Schools_Internet_District',
  'Laos_Schools_Students_Have_Own_Textbooks_Province',
  'Laos_Schools_Students_Have_Own_Textbooks_District',
  'Laos_Schools_Psychosocial_Support_Required_District',
  'Laos_Schools_Psychosocial_Support_Required_Province',
  'Laos_Schools_Teachers_Use_MoES_Website_District',
  'Laos_Schools_Teachers_Use_MoES_Website_Province',
  'Laos_Schools_Telephone_Available_District',
  'Laos_Schools_Telephone_Available_Province',
  'Laos_Schools_Textbooks_And_Additional_Learning_Materials_District',
  'Laos_Schools_Textbooks_And_Additional_Learning_Materials_Province',
];

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay"
    WHERE id IN (${arrayToDbString(OVERLAYS)});

    DELETE FROM map_overlay_group_relation
    WHERE child_id IN (${arrayToDbString(OVERLAYS)});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
