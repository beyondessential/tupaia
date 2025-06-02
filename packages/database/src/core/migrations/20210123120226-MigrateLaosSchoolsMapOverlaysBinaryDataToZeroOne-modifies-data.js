'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

// All map overlays that use Binary internal data which need to be updated
const MAP_OVERLAY_IDS = [
  'Laos_Schools_School_Indicators_Functioning_Computer',
  'Laos_Schools_TV_Sat_Receiver_And_Dish_District',
  'Laos_Schools_School_Indicators_Sub_National_Addtional_Learning_Reading_Materials_Since_June_2020_District',
  'Laos_Schools_Hygiene_Promotion',
  'Laos_Schools_COVID_Posters_And_Materials',
  'Laos_Schools_Thermometers_Received',
  'Laos_Schools_Functioning_Projector',
  'Laos_Schools_Traning_On_Digital_Literacy_And_MoES_Website_Resources_Received',
  'Laos_Schools_Support_Implementing_Catch_Up-Teaching_Programmes_Received',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Water_Supply_All_Year_District',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Clean_Drinking_Water_District',
  'Laos_Schools_School_Indicators_Sub_National_Lao_Satellite_Receiver_Dish_Set_District',
  'Laos_Schools_School_Indicators_Sub_National_Addtional_Learning_Reading_Materials_Since_June_2020_Province',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Water_Supply_All_Year_Province',
  'Laos_Schools_School_Indicators_Sub_National_Access_To_Clean_Drinking_Water_Province',
  'Laos_Schools_School_Indicators_Sub_National_Lao_Satellite_Receiver_Dish_Set_Province',
  'Laos_Schools_Electricity_Province',
  'Laos_Schools_Hand_Washing_Province',
  'Laos_Schools_Remedial_Education_Province',
  'Laos_Schools_Covid_Posters_And_Materials_Province',
  'Laos_Schools_Students_Follow_MoES_On_TV_Province',
  'Laos_Schools_Digital_And_MoES_Training_Province',
  'Laos_Schools_Remedial_Teaching_Support_Province',
  'Laos_Schools_Functioning_Computer_District',
  'Laos_Schools_Students_Follow_MoES_On_TV_District',
  'Laos_Schools_Digital_And_MoES_Training_District',
  'Laos_Schools_Remedial_Teaching_Support_District',
  'Laos_Schools_Water_Supply_Province',
  'Laos_Schools_Thermometer_District',
  'Laos_Schools_Thermometer_Province',
  'Laos_Schools_Teachers_Follow_MoES_On_TV_District',
  'Laos_Schools_Teachers_Follow_MoES_On_TV_Province',
  'Laos_Schools_Functioning_Computer_Province',
  'Laos_Schools_Hygiene_Training_Within_3_Years_Province',
  'Laos_Schools_Hand_Washing_District',
  'Laos_Schools_Remedial_Education_District',
  'Laos_Schools_Functioning_Projector_Province',
  'Laos_Schools_Covid_Posters_And_Materials_District',
  'Laos_Schools_Hygiene_Training_Within_3_Years_District',
  'Laos_Schools_Schools_Implementing_Remedial_Education_Programmes',
  'Laos_Schools_Water_Supply_District',
  'Laos_Schools_Hand_Washing_Facility_Available',
  'Laos_Schools_Electricity_District',
  'Laos_Schools_TV_Sat_Receiver_And_Dish_Province',
  'Laos_Schools_School_Indicators_EiE_Additional_Reading_Materials_June_2020',
  'Laos_Schools_School_Indicators_EiE_Access_To_Water_Supply_All_Year_Round',
  'Laos_Schools_School_Indicators_EiE_Lao_Satellite_Receiver_And_Dish_Set',
  'Laos_Schools_School_Indicators_EiE_Access_To_Clean_Drinking_Water',
  'Laos_Schools_Functioning_Projector_District',
  'Laos_Schools_School_Indicators_Electricity_Available',
  'Laos_Schools_School_Indicators_Access_To_Clean_Water',
];

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
  // Modify config for Laos Schools map overlays, from <"Yes"> to <1> (I've run through all the configs and it is safe to do so)
  await db.runSql(`
    update "mapOverlay" mo
    set "measureBuilderConfig" = regexp_replace(mo."measureBuilderConfig"::text, '"Yes"','1','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);

  // Modify config for Laos Schools map overlays, from <"No"> to <0> (I've run through all the configs and it is safe to do so)
  await db.runSql(`
    update "mapOverlay" mo
    set "measureBuilderConfig" = regexp_replace(mo."measureBuilderConfig"::text, '"No"','0','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);

  // Modify presentation options for Laos Schools map overlays, from <"Yes"> to <1>
  await db.runSql(`
    update "mapOverlay" mo
    set "presentationOptions" = regexp_replace(mo."presentationOptions"::text, '"value": "Yes"','"value": 1','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);

  // Modify presentation options for Laos Schools map overlays, from <"No"> to <1>
  await db.runSql(`
    update "mapOverlay" mo
    set "presentationOptions" = regexp_replace(mo."presentationOptions"::text, '"value": "No"','"value": 0','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
