'use strict';

import { codeToId } from '../utilities';

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

const FIJI_COVID_VACCINE_MAP_OVERLAY_ORDERED = [
  'FJ_COVID_TRACKING_Dose_1_Facility',
  'FJ_COVID_TRACKING_Dose_1_SubDistrict',
  'FJ_COVID_TRACKING_Dose_1_District',
  'FJ_COVID_TRACKING_Dose_1_SubDistrict_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_1_District_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_2_Facility',
  'FJ_COVID_TRACKING_Dose_2_SubDistrict',
  'FJ_COVID_TRACKING_Dose_2_District',
  'FJ_COVID_TRACKING_Dose_2_SubDistrict_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_2_District_Percentage_Vaccinated',
];

const reorderGroupOverlays = async (db, overlayOrders, groupCode) => {
  for (let index = 0; index < overlayOrders.length; index++) {
    const overlayId = overlayOrders[index];
    const groupId = await codeToId(db, 'map_overlay_group', groupCode);
    await db.runSql(`
      UPDATE map_overlay_group_relation
      SET sort_order = ${index}
      WHERE child_id = '${overlayId}'
      AND child_type = 'mapOverlay'
      AND map_overlay_group_id = '${groupId}'
    `);
  }
};

exports.up = async function (db) {
  await reorderGroupOverlays(db, FIJI_COVID_VACCINE_MAP_OVERLAY_ORDERED, 'COVID19_Vaccine_Fiji');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
