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
const dengueBaseMapOverlayBySubDistrict = {
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
const dengueCaseMapOverlayBySubDistrict = {
  ...dengueBaseMapOverlayBySubDistrict,
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
const dengueDeathMapOverlayBySubDistrict = {
  ...dengueBaseMapOverlayBySubDistrict,
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
const dengueBaseMapOverlayByFacility = (color, hideFromPopup) => {
  const config = {
    ...dengueBaseMapOverlayBySubDistrict,
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
        '0, null': true,
      },
    },
  };
  if (hideFromPopup) {
    config.presentationOptions.hideFromPopup = hideFromPopup;
  }
  return config;
};
const dengueCaseMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Dengue_Cases_By_Facility',
  name: 'Dengue Cases by Facility',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Case',
      'Dengue_Fever_With_Warning_Signs_Case',
      'Severe_Dengue_Case',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
};
const dengueSevereCaseMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Severe',
  name: 'Dengue Cases (severe)',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: ['Severe_Dengue_Case'],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
};
const dengueOtherCaseMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Other',
  name: 'Dengue Cases (other)',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Case',
      'Dengue_Fever_With_Warning_Signs_Case',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
};
const dengueTotalCaseMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('blue'),
  id: 'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Total',
  name: 'Total Dengue Cases',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Case',
      'Dengue_Fever_With_Warning_Signs_Case',
      'Severe_Dengue_Case',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
};
// dengue Severe Case Vs Other MapOverlay By Facility
const dengueSevereCaseVsOtherMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('blue', true),
  id: 'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility',
  name: 'Dengue Cases by Facility: Severe v Other',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Case',
      'Dengue_Fever_With_Warning_Signs_Case',
      'Severe_Dengue_Case',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  linkedMeasures: `{"${dengueSevereCaseMapOverlayByFacility.id}","${dengueOtherCaseMapOverlayByFacility.id}","${dengueTotalCaseMapOverlayByFacility.id}"}`,
};
const dengueDeathMapOverlayByFacility = {
  ...dengueBaseMapOverlayByFacility('red'),
  id: 'LAOS_EOC_Total_Dengue_Deaths_By_Facility',
  name: 'Dengue Deaths by Facility',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataElementCodes: [
      'Dengue_Fever_Without_Warning_Signs_Death',
      'Dengue_Fever_With_Warning_Signs_Death',
      'Severe_Dengue_Death',
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
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

  for (const mapOverlay of [
    dengueCaseMapOverlayBySubDistrict,
    dengueDeathMapOverlayBySubDistrict,
    dengueCaseMapOverlayByFacility,
    dengueDeathMapOverlayByFacility,
    dengueSevereCaseVsOtherMapOverlayByFacility,
  ]) {
    await insertObject(db, 'mapOverlay', mapOverlay);
    mapOverlayGroupRelation.id = generateId();
    mapOverlayGroupRelation.child_id = mapOverlay.id;
    await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  }
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);

  for (const mapOverlay of [
    dengueSevereCaseMapOverlayByFacility,
    dengueOtherCaseMapOverlayByFacility,
    dengueTotalCaseMapOverlayByFacility,
  ]) {
    await insertObject(db, 'mapOverlay', mapOverlay);
  }
};

exports.down = async function (db) {
  await deleteObject(db, 'map_overlay_group_relation', {
    child_id: mapOverlayGroupToRootRelation.child_id,
  });
  for (const mapOverlay of [
    dengueCaseMapOverlayBySubDistrict,
    dengueDeathMapOverlayBySubDistrict,
    dengueCaseMapOverlayByFacility,
    dengueDeathMapOverlayByFacility,
    dengueSevereCaseVsOtherMapOverlayByFacility,
  ]) {
    await deleteObject(db, 'map_overlay_group_relation', {
      child_id: mapOverlay.id,
    });
    await deleteObject(db, 'mapOverlay', { id: mapOverlay.id });
  }
  await deleteObject(db, 'map_overlay_group', { code: dengueMapOverlayGroup.code });

  for (const mapOverlay of [
    dengueSevereCaseMapOverlayByFacility,
    dengueOtherCaseMapOverlayByFacility,
    dengueTotalCaseMapOverlayByFacility,
  ]) {
    await deleteObject(db, 'mapOverlay', { id: mapOverlay.id });
  }
};

exports._meta = {
  version: 1,
};
