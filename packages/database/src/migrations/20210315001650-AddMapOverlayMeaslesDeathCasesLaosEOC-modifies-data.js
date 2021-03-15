'use strict';

import { insertObject, generateId, deleteObject } from '../utilities';

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

const measlesBaseMapOverlayBySubDistrict = {
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  measureBuilderConfig: {
    aggregationType: 'SUM',
    programCodes: ['Measles_Case_Reporting'],
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'sub_district',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [{ color: 'grey', value: null }],
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
const measlesCaseMapOverlayBySubDistrict = {
  ...measlesBaseMapOverlayBySubDistrict,
  id: 'LAOS_EOC_Total_Measles_Cases_By_Sub_District',
  name: 'Measles Cases by Sub District',
  dataElementCode: 'Total_Positive_Measles_Cases',
};
const measlesDeathMapOverlayBySubDistrict = {
  ...measlesBaseMapOverlayBySubDistrict,
  id: 'LAOS_EOC_Total_Measles_Deaths_By_Sub_District',
  name: '	Measles Deaths by Sub District',
  dataElementCode: 'Total_Measles_Deaths',
};
const measlesBaseMapOverlayByFacility = color => ({
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  measureBuilderConfig: {
    aggregationType: 'SUM',
    programCodes: ['Measles_Case_Reporting'],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [
      {
        color,
        value: 'other',
      },
      {
        color: 'grey',
        value: null,
      },
    ],
    defaultTimePeriod: {
      unit: 'day',
      offset: 0,
    },
    displayType: 'radius',
    measureLevel: 'Facility',
    hideFromLegend: true,
    periodGranularity: 'one_day_at_a_time',
    hideByDefault: {
      null: true,
    },
  },
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_eoc"}',
});
const measlesCaseMapOverlayByFacility = {
  ...measlesBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Measles_Cases_By_Facility',
  name: 'Measles Cases by Facility',
  dataElementCode: 'Total_Positive_Measles_Cases',
};
const measlesDeathMapOverlayByFacility = {
  ...measlesBaseMapOverlayByFacility('red'),
  id: 'LAOS_EOC_Total_Measles_Deaths_By_Facility',
  name: 'Measles Deaths by Facility',
  dataElementCode: 'Total_Positive_Measles_Cases',
};
const measlesMapOverlayGroup = {
  name: 'Measles',
  code: 'LAOS_EOC_Measles',
};

const mapOverlayGroupRelation = {
  child_type: 'mapOverlay',
};

// Root
const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_type: 'mapOverlayGroup',
};

const getMeaslesMapOverlayGroupId = async db => {
  const { rows } = await db.runSql(
    `
    SELECT id from map_overlay_group 
    WHERE code = '${measlesMapOverlayGroup.code}'
    `,
  );
  return rows.length ? rows.id : false;
};

const setMeaslesMapOverlayGroupId = async db => {
  const measlesMapOverlayGroupId = await getMeaslesMapOverlayGroupId(db);
  if (measlesMapOverlayGroupId) {
    measlesMapOverlayGroup.id = measlesMapOverlayGroup;
  } else {
    measlesMapOverlayGroup.id = generateId();
    await insertObject(db, 'map_overlay_group', measlesMapOverlayGroup);
  }
  mapOverlayGroupRelation.map_overlay_group_id = measlesMapOverlayGroup.id;
  mapOverlayGroupToRootRelation.child_id = measlesMapOverlayGroup.id;
};

const insertOverlays = async db => {
  for (const mapOverlay of [
    measlesCaseMapOverlayBySubDistrict,
    measlesDeathMapOverlayBySubDistrict,
    measlesCaseMapOverlayByFacility,
    measlesDeathMapOverlayByFacility,
  ]) {
    await insertObject(db, 'mapOverlay', mapOverlay);
    mapOverlayGroupRelation.id = generateId();
    mapOverlayGroupRelation.child_id = mapOverlay.id;
    await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  }
};

exports.up = async function (db) {
  await setMeaslesMapOverlayGroupId(db);

  await insertOverlays(db);

  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);
};

exports.down = async function (db) {
  await deleteObject(db, 'map_overlay_group_relation', {
    child_id: mapOverlayGroupToRootRelation.child_id,
  });
  for (const mapOverlay of [
    measlesCaseMapOverlayBySubDistrict,
    measlesDeathMapOverlayBySubDistrict,
    measlesCaseMapOverlayByFacility,
    measlesDeathMapOverlayByFacility,
  ]) {
    await deleteObject(db, 'map_overlay_group_relation', {
      child_id: mapOverlay.id,
    });
    await deleteObject(db, 'mapOverlay', { id: mapOverlay.id });
  }
  await deleteObject(db, 'map_overlay_group', { code: measlesMapOverlayGroup.code });
};

exports._meta = {
  version: 1,
};
