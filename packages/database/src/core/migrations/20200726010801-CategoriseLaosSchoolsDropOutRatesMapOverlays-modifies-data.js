'use strict';

import { insertObject, generateId, arrayToDbString } from '../utilities';

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

const DISTRICT_DROP_OUT_MAP_OVERLAYS = [
  'Laos_Schools_Total_Drop_Out_Grade_3_District',
  'Laos_Schools_Total_Drop_Out_Grade_1_District',
  'Laos_Schools_Total_Drop_Out_Grade_2_District',
  'Laos_Schools_Total_Drop_Out_Grade_4_District',
  'Laos_Schools_Total_Drop_Out_Grade_5_District',
  'Laos_Schools_Total_Drop_Out_Grade_6_District',
  'Laos_Schools_Total_Drop_Out_Grade_7_District',
  'Laos_Schools_Total_Drop_Out_Grade_8_District',
  'Laos_Schools_Total_Drop_Out_Grade_9_District',
  'Laos_Schools_Total_Drop_Out_Grade_10_District',
  'Laos_Schools_Total_Drop_Out_Grade_11_District',
  'Laos_Schools_Total_Drop_Out_Grade_12_District',
  'Laos_Schools_Total_Drop_Out_Primary_District',
  'Laos_Schools_Total_Drop_Out_Lower_Secondary_District',
  'Laos_Schools_Total_Drop_Out_Upper_Secondary_District',
];

const PROVINCE_DROP_OUT_MAP_OVERLAYS = [
  'Laos_Schools_Total_Drop_Out_Grade_1_Province',
  'Laos_Schools_Total_Drop_Out_Grade_2_Province',
  'Laos_Schools_Total_Drop_Out_Grade_3_Province',
  'Laos_Schools_Total_Drop_Out_Grade_4_Province',
  'Laos_Schools_Total_Drop_Out_Grade_5_Province',
  'Laos_Schools_Total_Drop_Out_Grade_6_Province',
  'Laos_Schools_Total_Drop_Out_Grade_7_Province',
  'Laos_Schools_Total_Drop_Out_Grade_8_Province',
  'Laos_Schools_Total_Drop_Out_Grade_9_Province',
  'Laos_Schools_Total_Drop_Out_Grade_10_Province',
  'Laos_Schools_Total_Drop_Out_Grade_11_Province',
  'Laos_Schools_Total_Drop_Out_Grade_12_Province',
  'Laos_Schools_Total_Drop_Out_Primary_Province',
  'Laos_Schools_Total_Drop_Out_Lower_Secondary_Province',
  'Laos_Schools_Total_Drop_Out_Upper_Secondary_Province',
];

const selectAllDistrictDropOutRateMapOverlays = async db =>
  db.runSql(`
    SELECT "mapOverlay".* 
    FROM "mapOverlay" 
    WHERE id IN (${arrayToDbString(DISTRICT_DROP_OUT_MAP_OVERLAYS)})
  `);

const selectAllProvinceDropOutRateMapOverlays = async db =>
  db.runSql(`
    SELECT "mapOverlay".* 
    FROM "mapOverlay" 
    WHERE id IN (${arrayToDbString(PROVINCE_DROP_OUT_MAP_OVERLAYS)})
  `);

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM map_overlay_group_relation where map_overlay_group_id IN (SELECT id FROM map_overlay_group where name IN ('Drop-out Rate in Province', 'Drop-out Rate in District'));
    DELETE FROM map_overlay_group where name = 'Drop-out Rate in Province';
    DELETE FROM map_overlay_group where name = 'Drop-out Rate in District';
`);

  const dropOutRatesOverlayGroupId = generateId();
  const dropOutRatesDistrictLevelOverlayGroupId = generateId();
  const dropOutRatesProvinceLevelOverlayGroupId = generateId();

  const dropOutRatesOverlayGroup = {
    id: dropOutRatesOverlayGroupId,
    name: 'Drop-out Rates',
    code: 'Laos_Schools_Drop_Out_Rates_Group',
  };

  const dropOutRatesDistrictLevelOverlayGroup = {
    id: dropOutRatesDistrictLevelOverlayGroupId,
    name: 'District Level',
    code: 'Laos_Schools_Drop_Out_Rates_District_Level_Group',
  };

  const dropOutRatesProvinceLevelOverlayGroup = {
    id: dropOutRatesProvinceLevelOverlayGroupId,
    name: 'Province Level',
    code: 'Laos_Schools_Drop_Out_Rates_Province_Level_Group',
  };

  const dropOutRatesDistrictLevelOverlayGroupConnection = {
    id: generateId(),
    map_overlay_group_id: dropOutRatesOverlayGroupId,
    child_id: dropOutRatesDistrictLevelOverlayGroupId,
    child_type: 'mapOverlayGroup',
  };

  const dropOutRatesProvinceLevelOverlayGroupConnection = {
    id: generateId(),
    map_overlay_group_id: dropOutRatesOverlayGroupId,
    child_id: dropOutRatesProvinceLevelOverlayGroupId,
    child_type: 'mapOverlayGroup',
  };

  await insertObject(db, 'map_overlay_group', dropOutRatesOverlayGroup);
  await insertObject(db, 'map_overlay_group', dropOutRatesDistrictLevelOverlayGroup);
  await insertObject(db, 'map_overlay_group', dropOutRatesProvinceLevelOverlayGroup);
  await insertObject(
    db,
    'map_overlay_group_relation',
    dropOutRatesDistrictLevelOverlayGroupConnection,
  );
  await insertObject(
    db,
    'map_overlay_group_relation',
    dropOutRatesProvinceLevelOverlayGroupConnection,
  );

  const districtDropOutRateMapOverlays = await selectAllDistrictDropOutRateMapOverlays(db);
  const provinceDropOutRateMapOverlays = await selectAllProvinceDropOutRateMapOverlays(db);

  for (let i = 0; i < districtDropOutRateMapOverlays.rows.length; i++) {
    const mapOverlay = districtDropOutRateMapOverlays.rows[i];
    const dropOutRatesDistrictLevelOverlayConnection = {
      id: generateId(),
      map_overlay_group_id: dropOutRatesDistrictLevelOverlayGroupId,
      child_id: mapOverlay.id,
      child_type: 'mapOverlay',
    };

    await insertObject(
      db,
      'map_overlay_group_relation',
      dropOutRatesDistrictLevelOverlayConnection,
    );
  }

  for (let i = 0; i < provinceDropOutRateMapOverlays.rows.length; i++) {
    const mapOverlay = provinceDropOutRateMapOverlays.rows[i];
    const dropOutRatesProvinceLevelOverlayConnection = {
      id: generateId(),
      map_overlay_group_id: dropOutRatesProvinceLevelOverlayGroupId,
      child_id: mapOverlay.id,
      child_type: 'mapOverlay',
    };

    await insertObject(
      db,
      'map_overlay_group_relation',
      dropOutRatesProvinceLevelOverlayConnection,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
