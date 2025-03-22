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

const DISTRICT_REPETITION_MAP_OVERLAYS = [
  'Laos_Schools_Total_Repetition_Grade_1_District',
  'Laos_Schools_Total_Repetition_Grade_2_District',
  'Laos_Schools_Total_Repetition_Grade_3_District',
  'Laos_Schools_Total_Repetition_Grade_4_District',
  'Laos_Schools_Total_Repetition_Grade_5_District',
  'Laos_Schools_Total_Repetition_Grade_6_District',
  'Laos_Schools_Total_Repetition_Grade_7_District',
  'Laos_Schools_Total_Repetition_Grade_8_District',
  'Laos_Schools_Total_Repetition_Grade_9_District',
  'Laos_Schools_Total_Repetition_Grade_10_District',
  'Laos_Schools_Total_Repetition_Grade_11_District',
  'Laos_Schools_Total_Repetition_Grade_12_District',
  'Laos_Schools_Total_Repetition_Primary_District',
  'Laos_Schools_Total_Repetition_Lower_Secondary_District',
  'Laos_Schools_Total_Repetition_Upper_Secondary_District',
];

const PROVINCE_REPETITION_MAP_OVERLAYS = [
  'Laos_Schools_Total_Repetition_Grade_1_Province',
  'Laos_Schools_Total_Repetition_Grade_2_Province',
  'Laos_Schools_Total_Repetition_Grade_3_Province',
  'Laos_Schools_Total_Repetition_Grade_4_Province',
  'Laos_Schools_Total_Repetition_Grade_5_Province',
  'Laos_Schools_Total_Repetition_Grade_6_Province',
  'Laos_Schools_Total_Repetition_Grade_7_Province',
  'Laos_Schools_Total_Repetition_Grade_8_Province',
  'Laos_Schools_Total_Repetition_Grade_9_Province',
  'Laos_Schools_Total_Repetition_Grade_10_Province',
  'Laos_Schools_Total_Repetition_Grade_11_Province',
  'Laos_Schools_Total_Repetition_Grade_12_Province',
  'Laos_Schools_Total_Repetition_Primary_Province',
  'Laos_Schools_Total_Repetition_Lower_Secondary_Province',
  'Laos_Schools_Total_Repetition_Upper_Secondary_Province',
];

const selectAllDistrictRepetitionRateMapOverlays = async db =>
  db.runSql(`
    SELECT "mapOverlay".* 
    FROM "mapOverlay" 
    WHERE id IN (${arrayToDbString(DISTRICT_REPETITION_MAP_OVERLAYS)})
  `);

const selectAllProvinceRepetitionRateMapOverlays = async db =>
  db.runSql(`
    SELECT "mapOverlay".* 
    FROM "mapOverlay" 
    WHERE id IN (${arrayToDbString(PROVINCE_REPETITION_MAP_OVERLAYS)})
  `);

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM map_overlay_group_relation where map_overlay_group_id IN (SELECT id FROM map_overlay_group where name IN ('Repetition Rate in Province', 'Repetition Rate in District'));
    DELETE FROM map_overlay_group where name = 'Repetition Rate in Province';
    DELETE FROM map_overlay_group where name = 'Repetition Rate in District';
`);

  const repetitionRatesOverlayGroupId = generateId();
  const repetitionRatesDistrictLevelOverlayGroupId = generateId();
  const repetitionRatesProvinceLevelOverlayGroupId = generateId();

  const repetitionRatesOverlayGroup = {
    id: repetitionRatesOverlayGroupId,
    name: 'Repetition Rates',
    code: 'Laos_Schools_Repetition_Rates_Group',
  };

  const repetitionRatesDistrictLevelOverlayGroup = {
    id: repetitionRatesDistrictLevelOverlayGroupId,
    name: 'District Level',
    code: 'Laos_Schools_Repetition_Rates_District_Level_Group',
  };

  const repetitionRatesProvinceLevelOverlayGroup = {
    id: repetitionRatesProvinceLevelOverlayGroupId,
    name: 'Province Level',
    code: 'Laos_Schools_Repetition_Rates_Province_Level_Group',
  };

  const repetitionRatesDistrictLevelOverlayGroupConnection = {
    id: generateId(),
    map_overlay_group_id: repetitionRatesOverlayGroupId,
    child_id: repetitionRatesDistrictLevelOverlayGroupId,
    child_type: 'mapOverlayGroup',
  };

  const repetitionRatesProvinceLevelOverlayGroupConnection = {
    id: generateId(),
    map_overlay_group_id: repetitionRatesOverlayGroupId,
    child_id: repetitionRatesProvinceLevelOverlayGroupId,
    child_type: 'mapOverlayGroup',
  };

  await insertObject(db, 'map_overlay_group', repetitionRatesOverlayGroup);
  await insertObject(db, 'map_overlay_group', repetitionRatesDistrictLevelOverlayGroup);
  await insertObject(db, 'map_overlay_group', repetitionRatesProvinceLevelOverlayGroup);
  await insertObject(
    db,
    'map_overlay_group_relation',
    repetitionRatesDistrictLevelOverlayGroupConnection,
  );
  await insertObject(
    db,
    'map_overlay_group_relation',
    repetitionRatesProvinceLevelOverlayGroupConnection,
  );

  const districtRepetitionRateMapOverlays = await selectAllDistrictRepetitionRateMapOverlays(db);
  const provinceRepetitionRateMapOverlays = await selectAllProvinceRepetitionRateMapOverlays(db);

  for (let i = 0; i < districtRepetitionRateMapOverlays.rows.length; i++) {
    const mapOverlay = districtRepetitionRateMapOverlays.rows[i];
    const repetitionRatesDistrictLevelOverlayConnection = {
      id: generateId(),
      map_overlay_group_id: repetitionRatesDistrictLevelOverlayGroupId,
      child_id: mapOverlay.id,
      child_type: 'mapOverlay',
    };

    await insertObject(
      db,
      'map_overlay_group_relation',
      repetitionRatesDistrictLevelOverlayConnection,
    );
  }

  for (let i = 0; i < provinceRepetitionRateMapOverlays.rows.length; i++) {
    const mapOverlay = provinceRepetitionRateMapOverlays.rows[i];
    const repetitionRatesProvinceLevelOverlayConnection = {
      id: generateId(),
      map_overlay_group_id: repetitionRatesProvinceLevelOverlayGroupId,
      child_id: mapOverlay.id,
      child_type: 'mapOverlay',
    };

    await insertObject(
      db,
      'map_overlay_group_relation',
      repetitionRatesProvinceLevelOverlayConnection,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
