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
  name: 'Measles Cases by District',
  dataElementCode: 'Total_Positive_Measles_Cases',
};
const measlesDeathMapOverlayBySubDistrict = {
  ...measlesBaseMapOverlayBySubDistrict,
  id: 'LAOS_EOC_Total_Measles_Deaths_By_Sub_District',
  name: '	Measles Deaths by District',
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

const getMeaslesMapOverlayGroupId = async db => {
  const { rows } = await db.runSql(
    `
    SELECT id from map_overlay_group
    WHERE code = 'LAOS_EOC_Measles'
    `,
  );
  return rows[0].id;
};

exports.up = async function (db) {
  const mapOverlayGroupRelation = {
    child_type: 'mapOverlay',
    map_overlay_group_id: await getMeaslesMapOverlayGroupId(db),
  };

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

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
