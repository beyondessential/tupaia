'use strict';

import { generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const ROOT_MAP_OVERLAY_ID = '5f88d3a361f76a2d3f000004';

const COUNTRIES = ['WS', 'FJ', 'NR'];

const MAP_OVERLAY_GROUP_BY_COUNTRY = {
  WS: {
    id: '5f88d3a261f76a2d3f000001', // COVID-19 Samoa
  },
  FJ: {
    id: generateId(),
    name: 'COVID-19 Fiji',
    code: 'COVID19_Fiji',
  },
  NR: {
    id: generateId(),
    name: 'COVID-19 Nauru',
    code: 'COVID19_Nauru',
  },
}

const MAP_OVERLAY_TEMPLATES = {
  Total_Number_Of_People_1st_Dose_Covid_Vaccine: {
    name: 'Total number of people received 1st dose of COVID-19 vaccine',
    userGroup: 'COVID-19',
    dataElementCode: 'COVIDVac4',
    measureBuilder: 'sumAllPerOrgUnit',
    measureBuilderConfig: null, // see MAP_OVERLAY_CONFIG_TEMPLATES
    presentationOptions: null, // see MAP_OVERLAY_CONFIG_TEMPLATES
  },
  Total_Number_Of_People_2nd_Dose_Covid_Vaccine: {
    name: 'Total number of people received 2nd dose of COVID-19 vaccine',
    userGroup: 'COVID-19',
    dataElementCode: 'COVIDVac8',
    measureBuilder: 'sumAllPerOrgUnit',
    measureBuilderConfig: null, // see MAP_OVERLAY_CONFIG_TEMPLATES
    presentationOptions: null, // see MAP_OVERLAY_CONFIG_TEMPLATES
  },
}

const MAP_OVERLAY_CONFIG_TEMPLATES = {
  BY_VILLAGE: {
    measureBuilderConfig: {"entityAggregation": {"aggregationType": "REPLACE_ORG_UNIT_WITH_ORG_GROUP", "dataSourceEntityType": "village", "aggregationEntityType": "village"}},
    presentationOptions: {"scaleType": "neutral", "displayType": "spectrum", "measureLevel": "Village"},
  },
  BY_DISTRICT: {
    measureBuilderConfig: {"entityAggregation": {"aggregationType": "REPLACE_ORG_UNIT_WITH_ORG_GROUP", "dataSourceEntityType": "district", "aggregationEntityType": "district"}},
    presentationOptions: {"scaleType": "performanceDesc", "valueType": "number", "displayType": "shaded-spectrum", "measureLevel": "District"},
  }
}

const MAP_OVERLAYS_BY_COUNTRY = {
  WS: [
    {
      id: 'COVID_WS_Total_Number_Of_People_1st_Dose_Covid_Vaccine',
      countryCodes: '{WS}',
      projectCodes: '{covid_samoa}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_1st_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_VILLAGE,
    },
    {
      id: 'COVID_WS_Total_Number_Of_People_2nd_Dose_Covid_Vaccine',
      countryCodes: '{WS}',
      projectCodes: '{covid_samoa}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_2nd_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_VILLAGE,
    },
  ],
  FJ: [
    {
      id: 'COVID_FJ_Total_Number_Of_People_1st_Dose_Covid_Vaccine',
      countryCodes: '{FJ}',
      projectCodes: '{supplychain_fiji}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_1st_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_DISTRICT,
    },
    {
      id: 'COVID_FJ_Total_Number_Of_People_2nd_Dose_Covid_Vaccine',
      countryCodes: '{FJ}',
      projectCodes: '{supplychain_fiji}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_2nd_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_DISTRICT,
    },
  ],
  NR: [
    {
      id: 'COVID_NR_Total_Number_Of_People_1st_Dose_Covid_Vaccine',
      countryCodes: '{NR}',
      projectCodes: '{ehealth_nauru}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_1st_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_DISTRICT,
    },
    {
      id: 'COVID_NR_Total_Number_Of_People_2nd_Dose_Covid_Vaccine',
      countryCodes: '{NR}',
      projectCodes: '{ehealth_nauru}',
      ...MAP_OVERLAY_TEMPLATES.Total_Number_Of_People_2nd_Dose_Covid_Vaccine,
      ...MAP_OVERLAY_CONFIG_TEMPLATES.BY_DISTRICT,
    },
  ],
};

exports.up = async function(db) {
  // 1. groups
  for (const group of Object.values(MAP_OVERLAY_GROUP_BY_COUNTRY)) {
    if (group.name) {
      // new group, need to insert
      await insertObject(db, 'map_overlay_group', group);
      await insertObject(db, 'map_overlay_group_relation', {
        id: generateId(),
        map_overlay_group_id: ROOT_MAP_OVERLAY_ID,
        child_id: group.id,
        child_type: 'mapOverlayGroup',
      })
    }
  }

  // 2. map overlays
  for (const country of COUNTRIES) {
    const group = MAP_OVERLAY_GROUP_BY_COUNTRY[country];
    for (const mapOverlay of MAP_OVERLAYS_BY_COUNTRY[country]) {
      await insertObject(db, 'mapOverlay', mapOverlay);
      await insertObject(db, 'map_overlay_group_relation', {
        id: generateId(),
        map_overlay_group_id: group.id,
        child_id: mapOverlay.id,
        child_type: 'mapOverlay',
      });
    }
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
