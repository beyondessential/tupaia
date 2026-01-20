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

const DATA_ELEMENT_TRANSLATIONS = {
  pe: {
    p1: 'Grade 1',
    p2: 'Grade 2',
    p3: 'Grade 3',
    p4: 'Grade 4',
    p5: 'Grade 5',
    pe: 'Total',
  },
  lse: {
    s1: 'Grade 6',
    s2: 'Grade 7',
    s3: 'Grade 8',
    s4: 'Grade 9',
    lse: 'Total',
  },
  use: {
    s5: 'Grade 10',
    s6: 'Grade 11',
    s7: 'Grade 12',
    use: 'Total',
  },
};

const generateReportConfig = (entityLevel, educationLevel) => ({
  fetch: {
    dataElements: Object.keys(DATA_ELEMENT_TRANSLATIONS[educationLevel])
      .flatMap(grade => [
        `dor_${entityLevel}_${grade}_m`,
        `dor_${entityLevel}_${grade}_f`,
        `dor_${entityLevel}_${grade}_t`,
      ]),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'grade'": "$row.dataElement.split('_')[3]",
      "'gender'": "$row.dataElement.split('_')[4]",
      '...': '*',
    },
    {
      transform: 'select',
      "'Male'": "eq($row.gender, 'm') ? $row.value/100 : undefined",
      "'Female'": "eq($row.gender, 'f') ? $row.value/100 : undefined",
      "'Total'": "eq($row.gender, 't') ? $row.value/100 : undefined",
      "'name'": `translate($row.grade, ${JSON.stringify(
        DATA_ELEMENT_TRANSLATIONS[educationLevel],
      )})`,
    },
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'last',
    },
    {
      transform: 'sort',
      by: '$row.name',
    },
  ],
});

const BASE_FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'bar',
  yName: 'Dropout Rate',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'percentage',
  chartConfig: {
    Male: {
      color: '#f44336',
      stackId: '1',
      legendOrder: '1',
    },
    Female: {
      color: '#2196f3',
      stackId: '2',
      legendOrder: '2',
    },
    Total: {
      color: '#9c27b0',
      stackId: '3',
      legendOrder: '3',
    },
  },
  presentationOptions: {
    hideAverage: true,
  },
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_province_dropout_rate_primary',
    reportConfig: generateReportConfig('province', 'pe'),
    entityTypes: ['district'],
    frontEndConfig: {
      name: 'Primary School Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
  },
  {
    code: 'LESMIS_province_dropout_rate_lower_secondary',
    reportConfig: generateReportConfig('province', 'lse'),
    entityTypes: ['district'],
    frontEndConfig: {
      name: 'LSE Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
  },
  {
    code: 'LESMIS_province_dropout_rate_upper_secondary',
    reportConfig: generateReportConfig('province', 'use'),
    entityTypes: ['district'],
    frontEndConfig: {
      name: 'USE Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
  },
  {
    code: 'LESMIS_country_dropout_rate_primary',
    reportConfig: generateReportConfig('country', 'pe'),
    entityTypes: ['country'],
    frontEndConfig: {
      name: 'Primary School Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
  },
  {
    code: 'LESMIS_country_dropout_rate_lower_secondary',
    reportConfig: generateReportConfig('country', 'lse'),
    entityTypes: ['country'],
    frontEndConfig: {
      name: 'LSE Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
  },
  {
    code: 'LESMIS_country_dropout_rate_upper_secondary',
    reportConfig: generateReportConfig('country', 'use'),
    entityTypes: ['country'],
    frontEndConfig: {
      name: 'USE Dropout Rates',
      ...BASE_FRONT_END_CONFIG,
    },
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
  for (const { code, reportConfig, entityTypes, frontEndConfig } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LA_Student_Outcomes',
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
