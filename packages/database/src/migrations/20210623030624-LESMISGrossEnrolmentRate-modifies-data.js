'use strict';

import { insertObject, generateId, findSingleRecord } from '../utilities';

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

const CODE = 'LESMIS_gross_enrolment_rate';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'ger_district_pe_t',
      'ger_district_pe_f',
      'ger_district_pe_m',
      'ger_district_lse_t',
      'ger_district_lse_f',
      'ger_district_lse_m',
      'ger_district_use_t',
      'ger_district_use_f',
      'ger_district_use_m',
    ],
    aggregations: [
      {
        type: 'MOST_RECENT',
        config: {
          dataSourceEntityType: 'sub_district',
        },
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, { ger_district_pe_t: 'Primary', ger_district_pe_f: 'Primary', ger_district_pe_m: 'Primary', ger_district_lse_t: 'Lower Secondary', ger_district_lse_f: 'Lower Secondary', ger_district_lse_m: 'Lower Secondary', ger_district_use_t: 'Upper Secondary', ger_district_use_f: 'Upper Secondary', ger_district_use_m: 'Upper Secondary' })",
      '...': '*',
    },
    'keyValueByDataElementName',
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'Male'": 'sum([$row.ger_district_pe_m, $row.ger_district_lse_m, $row.ger_district_use_m])',
      "'Female'": 'sum([$row.ger_district_pe_f, $row.ger_district_lse_f, $row.ger_district_use_f])',
      "'Total'": 'sum([$row.ger_district_pe_t, $row.ger_district_lse_t, $row.ger_district_use_t])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Primary': 1', 'Lower Secondary': '2', 'Upper Secondary': '3' })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['name', 'Male', 'Female', 'Total', 'GPI'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Gross Enrolment Rate - GER (by grade and gender, GPI)',
  type: 'chart',
  chartType: 'composed',
  xName: 'Level of Education',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    GPI: {
      chartType: 'line',
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
      legendOrder: '4',
    },
    Male: {
      chartType: 'bar',
      color: '#f44336',
      yName: 'Rate',
      stackId: '1',
      legendOrder: '1',
    },
    Female: {
      chartType: 'bar',
      color: '#2196f3',
      stackId: '2',
      legendOrder: '2',
    },
    Total: {
      chartType: 'bar',
      color: '#9c27b0',
      stackId: '3',
      legendOrder: '3',
    },
  },
};

const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, `SELECT id FROM permission_group WHERE name = '${permissionGroup}';`)
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
  await addItemToDashboard(db, { code, dashboardCode, entityTypes, projectCodes, permissionGroup });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (
    await findSingleRecord(db, `SELECT id FROM dashboard_item WHERE code = '${code}'`)
  ).id;
  const dashboardId = (
    await findSingleRecord(db, `SELECT id FROM dashboard WHERE code = '${dashboardCode}'`)
  ).id;
  const maxSortOrder = (
    await findSingleRecord(
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Student_Enrolment',
    entityTypes: ['sub_district'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
