'use strict';

import { insertObject, generateId, findSingleRecord, findSingleRecordBySql } from '../utilities';

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

const GENDER_CODES = ['m', 'f', 't'];

const generateReportConfig = (entityLevel, educationLevel, name) => ({
  fetch: {
    dataElements: GENDER_CODES.map(gender => `oafg_${entityLevel}_${educationLevel}_${gender}`),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'Male'": `exists($row.oafg_${entityLevel}_${educationLevel}_m) ? $row.oafg_${entityLevel}_${educationLevel}_m/100 : undefined`,
      "'Female'": `exists($row.oafg_${entityLevel}_${educationLevel}_f) ? $row.oafg_${entityLevel}_${educationLevel}_f/100 : undefined`,
      "'Total'": `exists($row.oafg_${entityLevel}_${educationLevel}_t) ? $row.oafg_${entityLevel}_${educationLevel}_t/100 : undefined`,
      "'name'": `'${name}'`,
    },
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'last',
    },
  ],
});

const FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'bar',
  xName: 'Level of Education',
  yName: 'Rate',
  valueType: 'percentage',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    Male: {
      color: '#f44336', // Red
      stackId: '1',
      legendOrder: '1',
    },
    Female: {
      color: '#2196f3', // Blue
      stackId: '2',
      legendOrder: '2',
    },
    Total: {
      color: '#9c27b0', // Purple
      stackId: '3',
      legendOrder: '3',
    },
  },
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_province_pe_children_over_age',
    frontEndConfig: {
      name: 'Percentage of children over-age for grade in primary education',
      ...FRONT_END_CONFIG,
    },
    reportConfig: generateReportConfig('province', 'pe', 'Primary'),
    entityTypes: ['district'],
  },
  {
    code: 'LESMIS_province_lse_children_over_age',
    frontEndConfig: {
      name: 'Percentage of children over-age for grade in lower secondary education',
      ...FRONT_END_CONFIG,
    },
    reportConfig: generateReportConfig('province', 'lse', 'Lower Secondary'),
    entityTypes: ['district'],
  },
  {
    code: 'LESMIS_country_pe_children_over_age',
    frontEndConfig: {
      name: 'Percentage of children over-age for grade in primary education',
      ...FRONT_END_CONFIG,
    },
    reportConfig: generateReportConfig('country', 'pe', 'Primary'),
    entityTypes: ['country'],
  },
  {
    code: 'LESMIS_country_lse_children_over_age',
    frontEndConfig: {
      name: 'Percentage of children over-age for grade in lower secondary education',
      ...FRONT_END_CONFIG,
    },
    reportConfig: generateReportConfig('country', 'lse', 'Lower Secondary'),
    entityTypes: ['country'],
  },
];

// Same util functions as always
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
  for (const { code, reportConfig, frontEndConfig, entityTypes } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_International_SDGs_students',
      entityTypes,
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
