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

const generateReportConfig = educationLevel => ({
  fetch: {
    dataElements: [
      `nostu_${educationLevel}_f_public`,
      `nostu_${educationLevel}_f_private`,
      `nostu_${educationLevel}_m_public`,
      `nostu_${educationLevel}_m_private`,
    ],
    aggregations: [
      'FINAL_EACH_YEAR',
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "translate($row.dataElement.split('_')[3], { m: 'Male', f: 'Female' })": '$row.value',
      "'name'":
        "translate($row.dataElement.split('_')[4], { public: 'Public', private: 'Private' })",
      "'timestamp'": 'periodToTimestamp($row.period)',
      '...': '*',
    },
    {
      transform: 'aggregate',
      timestamp: 'group',
      name: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'name'": "$row.name.concat(' ', $row.period)",
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      '...': ['Male', 'Female'],
    },
    {
      transform: 'sort',
      by: '$row.name',
    },
  ],
});

const FRONT_END_CONFIG = {
  name: 'Number of Students (Gender, GPI, Public/Private)',
  type: 'chart',
  chartType: 'composed',
  xName: 'Year',
  periodGranularity: 'year',
  chartConfig: {
    GPI: {
      chartType: 'line',
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
    },
    Male: {
      chartType: 'bar',
      labelType: 'fraction',
      color: '#f44336',
      stackId: '1',
      yName: 'Number of Students',
      valueType: 'number',
    },
    Female: {
      chartType: 'bar',
      labelType: 'fraction',
      color: '#2196f3',
      stackId: '1',
      valueType: 'number',
    },
  },
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_ESSDP_ece_NumberOfStudents',
    reportConfig: generateReportConfig('ece'),
    dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_HLO1',
  },
  {
    code: 'LESMIS_ESSDP_lse_NumberOfStudents',
    reportConfig: generateReportConfig('lse'),
    dashboardCode: 'LESMIS_ESSDP_LowerSecondarySubSector_HLO1',
  },
  {
    code: 'LESMIS_ESSDP_use_NumberOfStudents',
    reportConfig: generateReportConfig('use'),
    dashboardCode: 'LESMIS_ESSDP_UpperSecondarySubSector_HLO1',
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
  for (const { code, reportConfig, dashboardCode } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig: FRONT_END_CONFIG,
      permissionGroup: 'LESMIS Public',
      dashboardCode,
      entityTypes: ['sub_district', 'district', 'country'],
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
