'use strict';

import {
  insertObject,
  deleteObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
} from '../utilities';

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

const generateIndicator = (code, dataElement, target) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: `${target}`,
    aggregation: { [dataElement]: 'FINAL_EACH_YEAR' },
  },
});

const generateReport = dataElements => ({
  fetch: {
    dataElements: Object.values(dataElements),
    aggregations: ['FINAL_EACH_YEAR'],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'timestamp'": 'periodToTimestamp($row.period)',
      '...': '*',
    },
    {
      transform: 'aggregate',
      timestamp: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'Male'": `$row.${dataElements.male}/100`,
      "'Female'": `$row.${dataElements.female}/100`,
      "'GPI'": `$row.${dataElements.female}/$row.${dataElements.male}`,
      "'Total'": `$row.${dataElements.total}/100`,
      "'Target'": dataElements.target ? `$row.${dataElements.target}` : 'undefined',
      '...': ['timestamp'],
    },
  ],
});

const FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'composed',
  xName: 'Year',
  periodGranularity: 'year',
  chartConfig: {
    Male: {
      chartType: 'line',
      color: '#f44336',
      valueType: 'percentage',
      yName: 'Rate (%)',
    },
    Female: {
      chartType: 'line',
      color: '#2196f3',
      valueType: 'percentage',
    },
    Total: {
      chartType: 'line',
      color: '#9c27b0',
      valueType: 'percentage',
    },
    GPI: {
      chartType: 'line',
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
    },
    Target: {
      chartType: 'line',
      color: '#4caf50',
      valueType: 'percentage',
    },
  },
};

const FRONT_END_CONFIG_NO_TARGET = {
  type: 'chart',
  chartType: 'composed',
  xName: 'Year',
  periodGranularity: 'year',
  chartConfig: {
    Male: {
      chartType: 'line',
      color: '#f44336',
      valueType: 'percentage',
      yName: 'Rate (%)',
    },
    Female: {
      chartType: 'line',
      color: '#2196f3',
      valueType: 'percentage',
    },
    Total: {
      chartType: 'line',
      color: '#9c27b0',
      valueType: 'percentage',
    },
    GPI: {
      chartType: 'line',
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
    },
  },
};

const CONFIG_0_2_DATA_ELEMENTS = {
  male: 'er_district_ece_0_2_m',
  female: 'er_district_ece_0_2_f',
  total: 'er_district_ece_0_2_t',
  target: 'er_target_ece_0_2_t',
};
const CONFIG_0_2_REPORT = {
  code: 'LESMIS_enrolment_ece_0_2_target',
  indicator: generateIndicator('er_target_ece_0_2_t', 'er_district_ece_0_2_t', '0.07'),
  reportConfig: generateReport(CONFIG_0_2_DATA_ELEMENTS),
  frontEndConfig: { ...FRONT_END_CONFIG, name: 'Enrolment rate of 0-2 year old students in ECE' },
};

const CONFIG_3_4_DATA_ELEMENTS = {
  male: 'er_district_ece_3_4_m',
  female: 'er_district_ece_3_4_f',
  total: 'er_district_ece_3_4_t',
};
const CONFIG_3_4_REPORT = {
  code: 'LESMIS_enrolment_ece_3_4_target',
  reportConfig: generateReport(CONFIG_3_4_DATA_ELEMENTS),
  frontEndConfig: {
    ...FRONT_END_CONFIG_NO_TARGET,
    name: 'Enrolment rate of 3-4 year old students in ECE',
  },
};

const CONFIG_5_DATA_ELEMENTS = {
  male: 'er_district_ece_5_m',
  female: 'er_district_ece_5_f',
  total: 'er_district_ece_5_t',
  target: 'er_target_ece_5_t',
};
const CONFIG_5_REPORT = {
  code: 'LESMIS_enrolment_ece_5_target',
  indicator: generateIndicator('er_target_ece_5_t', 'er_district_ece_5_t', '0.86'),
  reportConfig: generateReport(CONFIG_5_DATA_ELEMENTS),
  frontEndConfig: { ...FRONT_END_CONFIG, name: 'Enrolment rate of 5 year old students in ECE' },
};

const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'report', {
    id: reportId,
    code,
    config: reportConfig,
    permission_group_id: permissionGroupId,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code,
    config: frontEndConfig,
    report_code: code,
  });

  // insert relation record connecting dashboard item to dashboard
  const dashboardId = (await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: `{${entityTypes.join(', ')}}`,
    project_codes: `{${projectCodes.join(', ')}}`,
    permission_groups: `{${permissionGroup}}`,
    sort_order: maxSortOrder + 1,
  });
};

const removeDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  for (const { code, indicator, reportConfig, frontEndConfig } of [
    CONFIG_0_2_REPORT,
    CONFIG_3_4_REPORT,
    CONFIG_5_REPORT,
  ]) {
    if (indicator) {
      await insertObject(db, 'indicator', indicator);
    }
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code, indicator } of [CONFIG_0_2_REPORT, CONFIG_3_4_REPORT, CONFIG_5_REPORT]) {
    if (indicator) {
      await deleteObject(db, 'indicator', { code: indicator.code });
    }
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
