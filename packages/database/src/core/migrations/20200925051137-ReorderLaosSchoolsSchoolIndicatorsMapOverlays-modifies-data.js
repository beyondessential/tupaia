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

const SCHOOL_INDICATORS_EIE_GROUP_CODE = 'School_Indicators_EiE';
const SCHOOL_INDICATORS_EIE_OVERLAYS_ORDERED = [
  'Laos_Schools_School_Type',
  'Laos_Schools_School_Indicators_Distance_From_Main_Road',
  'Laos_Schools_Used_As_Quarantine_Centre',
  'Laos_Schools_Development_Partners_Pin',
  'Laos_Schools_School_Indicators_EiE_Additional_Reading_Materials_June_2020',
  'Laos_Schools_COVID_Posters_And_Materials',
  'Laos_Schools_School_Indicators_EiE_School_Implementing_MOES',
  'Laos_Schools_Thermometers_Received',
  'Laos_Schools_Hygiene_Promotion',
  'Laos_Schools_Hand_Washing_Facility_Available',
  'Laos_Schools_School_Indicators_Access_To_Clean_Water',
  'Laos_Schools_School_Indicators_EiE_Access_To_Water_Supply_All_Year_Round',
  'Laos_Schools_School_Indicators_EiE_Access_To_Clean_Drinking_Water',
  'Laos_Schools_School_Indicators_Electricity_Available',
  'Laos_Schools_Functioning_TV_Satellite',
  'Laos_Schools_School_Indicators_EiE_Lao_Satellite_Receiver_And_Dish_Set',
  'Laos_Schools_School_Indicators_Functioning_Computer',
  'Laos_Schools_Functioning_Projector',
  'Laos_Schools_Teachers_Follow_MoES_Education_Show',
  'Laos_Schools_Students_Follow_MoES_Education_Show',
  'Laos_Schools_Traning_On_Digital_Literacy_And_MoES_Website_Resources_Received',
  'Laos_Schools_Schools_Implementing_Remedial_Education_Programmes',
  'Laos_Schools_Support_Implementing_Catch_Up-Teaching_Programmes_Received',
];

const SCHOOL_INDICATORS_EIE_SUB_NATIONAL_DISTRICT_GROUP_CODE = 'School_Indicators_by_District';
const SCHOOL_INDICATORS_EIE_SUB_NATIONAL_DISTRICT_OVERLAYS_ORDERED = [
  'Laos_Schools_Major_Dev_Partner_District',
  'Laos_Schools_School_Indicators_Sub_National_Addtional_Learning_Reading_Materials_Since_June_2020_District',
  'Laos_Schools_Covid_Posters_And_Materials_District',
  'Laos_Schools_School_Indicators_Sub_National_School_Implement_MOES_Protocols_Guidelines_District',
  'Laos_Schools_Thermometer_District',
  'Laos_Schools_Hygiene_Training_Within_3_Years_District',
  'Laos_Schools_Hand_Washing_District',
  'Laos_Schools_Water_Supply_District',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Water_Supply_All_Year_District',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Clean_Drinking_Water_District',
  'Laos_Schools_Electricity_District',
  'Laos_Schools_TV_Sat_Receiver_And_Dish_District',
  'Laos_Schools_School_Indicators_Sub_National_Lao_Satellite_Receiver_Dish_Set_District',
  'Laos_Schools_Functioning_Computer_District',
  'Laos_Schools_Functioning_Projector_District',
  'Laos_Schools_Teachers_Follow_MoES_On_TV_District',
  'Laos_Schools_Students_Follow_MoES_On_TV_District',
  'Laos_Schools_Digital_And_MoES_Training_District',
  'Laos_Schools_Remedial_Education_District',
  'Laos_Schools_Remedial_Teaching_Support_District',
];

const SCHOOL_INDICATORS_EIE_SUB_NATIONAL_PROVINCE_GROUP_CODE = 'School_Indicators_by_Province';
const SCHOOL_INDICATORS_EIE_SUB_NATIONAL_PROVINCE_OVERLAYS_ORDERED = [
  'Laos_Schools_Major_Dev_Partner_Province',
  'Laos_Schools_School_Indicators_Sub_National_Addtional_Learning_Reading_Materials_Since_June_2020_Province',
  'Laos_Schools_Covid_Posters_And_Materials_Province',
  'Laos_Schools_School_Indicators_Sub_National_School_Implement_MOES_Protocols_Guidelines_Province',
  'Laos_Schools_Thermometer_Province',
  'Laos_Schools_Hygiene_Training_Within_3_Years_Province',
  'Laos_Schools_Hand_Washing_Province',
  'Laos_Schools_Water_Supply_Province',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Water_Supply_All_Year_Province',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Clean_Drinking_Water_Province',
  'Laos_Schools_Electricity_Province',
  'Laos_Schools_TV_Sat_Receiver_And_Dish_Province',
  'Laos_Schools_School_Indicators_Sub_National_Lao_Satellite_Receiver_Dish_Set_Province',
  'Laos_Schools_Functioning_Computer_Province',
  'Laos_Schools_Functioning_Projector_Province',
  'Laos_Schools_Teachers_Follow_MoES_On_TV_Province',
  'Laos_Schools_Students_Follow_MoES_On_TV_Province',
  'Laos_Schools_Digital_And_MoES_Training_Province',
  'Laos_Schools_Remedial_Education_Province',
  'Laos_Schools_Remedial_Teaching_Support_Province',
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
  await reorderGroupOverlays(
    db,
    SCHOOL_INDICATORS_EIE_OVERLAYS_ORDERED,
    SCHOOL_INDICATORS_EIE_GROUP_CODE,
  );

  await reorderGroupOverlays(
    db,
    SCHOOL_INDICATORS_EIE_SUB_NATIONAL_DISTRICT_OVERLAYS_ORDERED,
    SCHOOL_INDICATORS_EIE_SUB_NATIONAL_DISTRICT_GROUP_CODE,
  );

  await reorderGroupOverlays(
    db,
    SCHOOL_INDICATORS_EIE_SUB_NATIONAL_PROVINCE_OVERLAYS_ORDERED,
    SCHOOL_INDICATORS_EIE_SUB_NATIONAL_PROVINCE_GROUP_CODE,
  );
};

exports.down = function (db) {
  return null; // No down migrations
};

exports._meta = {
  version: 1,
};
