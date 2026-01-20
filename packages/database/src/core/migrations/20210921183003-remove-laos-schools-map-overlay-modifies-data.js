'use strict';

import { codeToId, arrayToDbString } from '../utilities';

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

const MAP_OVERLAY_GROUPS = [
  'Laos_Schools_Student_Numbers_Provincial_Level_Group',
  'Laos_Schools_Student_Numbers_District_Level_Group',
  'Laos_Schools_Student_Numbers_School_Level_Group',
  'Laos_Schools_Repetition_Rates_District_Level_Group',
  'Laos_Schools_Repetition_Rates_Province_Level_Group',
  'Laos_Schools_Drop_Out_Rates_District_Level_Group',
  'Laos_Schools_Drop_Out_Rates_Province_Level_Group',
];

const removeMapOverlayGroupChildren = async (db, code) => {
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', code);

  // look up list of children
  const children = await db.runSql(
    `SELECT child_id FROM map_overlay_group_relation WHERE map_overlay_group_id = '${mapOverlayGroupId}';`,
  );

  const childIds = children.rows;

  // remove all the child map overlays
  if (childIds.length > 0) {
    await db.runSql(`
    DELETE FROM "mapOverlay" WHERE id IN (${arrayToDbString(childIds)});
  `);
  }

  // remove the relations
  await db.runSql(
    `DELETE FROM map_overlay_group_relation WHERE map_overlay_group_id = '${mapOverlayGroupId}';`,
  );
  return true;
};

exports.up = async function (db) {
  for (const code of MAP_OVERLAY_GROUPS) {
    await removeMapOverlayGroupChildren(db, code);
  }
  return true;
};

exports.down = function (db) {
  // no down migration
  return null;
};

exports._meta = {
  version: 1,
};
