'use strict';

import { codeToId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const LAOS_SCHOOLS_OVERLAY_GROUP_ORDERS = [
  'School_Indicators_EiE',
  'Laos_Schools_School_Indicators_EiE_Sub_National_Group',
  'Laos_Schools_Textbook_student_Ratio_Group',
  'Laos_Schools_Student_Numbers_Group',
  'Laos_Schools_Population_Group',
  'Laos_Schools_Repetition_Rates_Group',
  'Laos_Schools_Drop_Out_Rates_Group',
  'Development_Partner',
];

const WORLD_MAP_OVERLAY_GROUP_CODE = 'World_Group';

const reorderGroupOverlays = async (db, groupCodeOrders) => {
  const worldOverlayGroupId = await codeToId(db, 'map_overlay_group', WORLD_MAP_OVERLAY_GROUP_CODE);

  for (let index = 0; index < groupCodeOrders.length; index++) {
    const groupCode = groupCodeOrders[index];
    const groupId = await codeToId(db, 'map_overlay_group', groupCode);
    await db.runSql(`
      UPDATE map_overlay_group_relation
      SET sort_order = ${index}
      WHERE child_id = '${groupId}'
      AND map_overlay_group_id = '${worldOverlayGroupId}';
    `);
  }
};

exports.up = async function(db) {
  await reorderGroupOverlays(db, LAOS_SCHOOLS_OVERLAY_GROUP_ORDERS);
};

exports.down = function(db) {
  return null; //No migration down
};

exports._meta = {
  version: 1,
};
