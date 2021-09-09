'use strict';

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

const mapOverlayIds = [
  'LAOS_EOC_Total_Dengue_Cases_By_Facility',
  'LAOS_EOC_Total_Dengue_Deaths_By_Facility',
  'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility',
  'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Severe',
  'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Other',
  'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Total',
];

exports.up = async function (db) {
  for (const id of mapOverlayIds) {
    await db.runSql(`
        update "mapOverlay" mo 
        set "presentationOptions" = regexp_replace(mo."presentationOptions"::text, '\\"0\\, null\\"','"null"','g')::jsonb 
        where id = '${id}'
`);
  }
};

exports.down = async function (db) {
  for (const id of mapOverlayIds) {
    await db.runSql(`
        update "mapOverlay" mo 
        set "presentationOptions" = regexp_replace(mo."presentationOptions"::text, '\\"null\\"', '"0, null"','g')::jsonb 
        where id = '${id}'
`);
  }
};

exports._meta = {
  version: 1,
};
