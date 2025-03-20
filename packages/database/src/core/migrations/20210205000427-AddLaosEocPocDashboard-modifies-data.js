'use strict';

import { generateId, insertObject } from '../utilities';

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

const DATA_GROUP = {
  id: generateId(),
  code: 'NCLE_Communicable_Disease',
  type: 'dataGroup',
  service_type: 'dhis',
  config: { dhisId: 'h6x4kyzKyK3', isDataRegional: false },
};

const DATA_ELEMENT = {
  id: generateId(),
  code: 'NCLE_Disease_Name',
  type: 'dataElement',
  service_type: 'dhis',
  config: { dhisId: 'Dyq13cMGMzT', isDataRegional: false },
};

const DATA_ELEMENT_DATA_GROUP = {
  id: generateId(),
  data_element_id: DATA_ELEMENT.id,
  data_group_id: DATA_GROUP.id,
};

const DHIS_ORG_UNIT_ID_MAP = {
  LA: 'IWp9dQGM0bS', // adding for completeness
  'LA_Vientiane capital': 'W6sNfkJcXGC',
  LA_Phongsaly: 'YvLOmtTQD6b',
  'LA_Luang Namtha': 'XKGgynPS1WZ',
  LA_Oudomxay: 'rO2RVJWHpCe',
  LA_Bokeo: 'FRmrFTE63D0',
  LA_Luangprabang: 'MBZYTqkEgwf',
  LA_Houaphanh: 'hdeC7uX9Cko',
  LA_Xaignabouly: 'RdNV4tTRNEo',
  LA_Xiangkhouang: 'VWGSudnonm5',
  LA_Vientiane: 'quFXhkOJGB4',
  LA_Bolikhamsai: 'vBWtCmNNnCG',
  LA_Khammouane: 'c4HrGRJoarj',
  LA_Savannakhet: 'pFCZqWnXtoU',
  LA_Salavan: 'TOgZ99Jv0bN',
  LA_Sekong: 'dOhqCNenSjS',
  LA_Champasack: 'sv6c7CpPcrc',
  LA_Attapue: 'hRQsZhmvqgS',
  LA_Xaisomboun: 'K27JzTKmBKh',
};

const DASHBOARD_GROUP = {
  organisationLevel: 'District',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{LA_EOC_Total_Dengue_Cases_by_Week}',
  name: 'Dengue',
  code: 'LAOS_EOC_Dengue',
  projectCodes: '{laos_eoc}',
};

const DASHBOARD_REPORT = {
  id: 'LA_EOC_Total_Dengue_Cases_by_Week',
  dataBuilder: 'countEventsPerPeriodByDataValue2',
  dataBuilderConfig: {
    periodType: 'week',
    dataElement: 'NCLE_Disease_Name',
    programCode: 'NCLE_Communicable_Disease',
    dataElementCodes: ['NCLE_Disease_Name'],
    valuesOfInterest: [
      { label: 'Dengue fever without warning signs cases', value: '7.1' },
      { label: 'Dengue fever with warning signs cases', value: '7.2' },
      { label: 'Severe dengue cases', value: '7.3' },
    ],
    entityAggregation: { dataSourceEntityType: 'district' },
  },
  viewJson: {
    name: 'Total Dengue Cases by Week',
    type: 'chart',
    chartType: 'bar',
    valueType: 'number',
    chartConfig: {
      'Severe dengue cases': {
        color: '#fee906',
        label: 'Severe dengue cases',
        stackId: 1,
        legendOrder: 3,
      },
      'Dengue fever with warning signs cases': {
        color: '#fb0301',
        label: 'Dengue fever with warning signs cases',
        stackId: 1,
        legendOrder: 2,
      },
      'Dengue fever without warning signs cases': {
        color: '#2bb0f0',
        label: 'Dengue fever without warning signs cases',
        stackId: 1,
        legendOrder: 1,
      },
    },
    defaultTimePeriod: { end: { unit: 'week', offset: 0 }, start: { unit: 'week', offset: -52 } },
    periodGranularity: 'week',
  },
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  // 1. Add data sources
  await insertObject(db, 'data_source', DATA_GROUP);
  await insertObject(db, 'data_source', DATA_ELEMENT);
  await insertObject(db, 'data_element_data_group', DATA_ELEMENT_DATA_GROUP);

  // 2. Add org unit code to id mapping
  for (const orgUnitCode of Object.keys(DHIS_ORG_UNIT_ID_MAP)) {
    await insertObject(db, 'data_service_entity', {
      id: generateId(),
      entity_code: orgUnitCode,
      config: { dhis_id: DHIS_ORG_UNIT_ID_MAP[orgUnitCode] },
    });
  }

  // 3. Add dashboard
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  return null;
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
