'use strict';

import { insertObject, generateId } from '../utilities';

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
const deleteObject = async (db, table, condition) => {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
      DELETE FROM "${table}"
      WHERE ${key} = '${value}'
  `);
};
const dengueBaseMapOverlay = {
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  dataElementCode: 'value',
  measureBuilder: 'sumLatestPerOrgUnit',
  presentationOptions: {
    values: [{ color: 'green', value: 0 }],
    scaleType: 'performanceDesc',
    displayType: 'shaded-spectrum',
    scaleBounds: { left: { max: 0 } },
    measureLevel: 'SubDistrict',
    defaultTimePeriod: {
      unit: 'day',
      offset: 0,
    },
    periodGranularity: 'one_day_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_eoc"}',
};
const dengueDeathMapOverlay = {
  ...dengueBaseMapOverlay,
  id: 'LAOS_EOC_Total_Dengue_Deaths_By_Sub_District',
  name: 'Dengue Deaths by District',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Death',
      'Dengue_Fever_With_Warning_Signs_Death',
      'Severe_Dengue_Death',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'sub_district',
    },
  },
};
const dengueCaseMapOverlay = {
  ...dengueBaseMapOverlay,
  id: 'LAOS_EOC_Total_Dengue_Cases_By_Sub_District',
  name: 'Dengue Cases by District',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Case',
      'Dengue_Fever_With_Warning_Signs_Case',
      'Severe_Dengue_Case',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'sub_district',
    },
  },
};

const dengueMapOverlayGroup = {
  id: generateId(),
  name: 'Dengue',
  code: 'LAOS_EOC_Dengue',
};
const mapOverlayGroupRelation = {
  map_overlay_group_id: dengueMapOverlayGroup.id,
  child_type: 'mapOverlay',
};
// Root
const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: dengueMapOverlayGroup.id,
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', dengueMapOverlayGroup);

  for (const mapOverlay of [dengueCaseMapOverlay, dengueDeathMapOverlay]) {
    await insertObject(db, 'mapOverlay', mapOverlay);
    mapOverlayGroupRelation.id = generateId();
    mapOverlayGroupRelation.child_id = mapOverlay.id;
    await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  }

  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);
};

exports.down = async function (db) {
  await deleteObject(db, 'map_overlay_group_relation', {
    child_id: mapOverlayGroupToRootRelation.child_id,
  });
  for (const mapOverlay of [dengueCaseMapOverlay, dengueDeathMapOverlay]) {
    await deleteObject(db, 'map_overlay_group_relation', {
      child_id: mapOverlay.id,
    });
    await deleteObject(db, 'mapOverlay', { id: mapOverlay.id });
  }
  await deleteObject(db, 'map_overlay_group', { code: dengueMapOverlayGroup.code });
};

exports._meta = {
  version: 1,
};
