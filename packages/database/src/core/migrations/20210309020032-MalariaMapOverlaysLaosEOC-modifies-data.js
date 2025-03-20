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

const malariaBaseMapOverlayBySubDistrict = {
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  measureBuilderConfig: {
    aggregationType: 'SUM',
    programCodes: ['Malaria_Case_Reporting'],
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
const malariaCaseMapOverlayBySubDistrict = {
  ...malariaBaseMapOverlayBySubDistrict,
  id: 'LAOS_EOC_Total_Malaria_Cases_By_Sub_District',
  name: 'Malaria Cases by District',
  dataElementCode: 'Total_Positive_Malaria_Cases',
};
const malariaDeathMapOverlayBySubDistrict = {
  ...malariaBaseMapOverlayBySubDistrict,
  id: 'LAOS_EOC_Total_Malaria_Deaths_By_Sub_District',
  name: '	Malaria Deaths by District',
  dataElementCode: 'Total_Malaria_Deaths',
};
const malariaBaseMapOverlayByFacility = color => ({
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  measureBuilderConfig: {
    aggregationType: 'SUM',
    programCodes: ['Malaria_Case_Reporting'],
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
const malariaCaseMapOverlayByFacility = {
  ...malariaBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Malaria_Cases_By_Facility',
  name: 'Malaria Cases by Facility',
  dataElementCode: 'Total_Positive_Malaria_Cases',
};
const malariaDeathMapOverlayByFacility = {
  ...malariaBaseMapOverlayByFacility('red'),
  id: 'LAOS_EOC_Total_Malaria_Deaths_By_Facility',
  name: 'Malaria Deaths by Facility',
  dataElementCode: 'Total_Positive_Malaria_Cases',
};
const malariaMapOverlayGroup = {
  id: generateId(),
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria',
};
const mapOverlayGroupRelation = {
  map_overlay_group_id: malariaMapOverlayGroup.id,
  child_type: 'mapOverlay',
};
// Root
const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: malariaMapOverlayGroup.id,
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', malariaMapOverlayGroup);

  for (const mapOverlay of [
    malariaCaseMapOverlayBySubDistrict,
    malariaDeathMapOverlayBySubDistrict,
    malariaCaseMapOverlayByFacility,
    malariaDeathMapOverlayByFacility,
  ]) {
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
  for (const mapOverlay of [
    malariaCaseMapOverlayBySubDistrict,
    malariaDeathMapOverlayBySubDistrict,
    malariaCaseMapOverlayByFacility,
    malariaDeathMapOverlayByFacility,
  ]) {
    await deleteObject(db, 'map_overlay_group_relation', {
      child_id: mapOverlay.id,
    });
    await deleteObject(db, 'mapOverlay', { id: mapOverlay.id });
  }
  await deleteObject(db, 'map_overlay_group', { code: malariaMapOverlayGroup.code });
};

exports._meta = {
  version: 1,
};
