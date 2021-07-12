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

const CODE = 'LESMIS_teachers_education_level_district';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'noteach_pe_public_f',
      'noteach_pe_public_m',
      'noteach_pe_private_f',
      'noteach_pe_private_m',
      'noteach_se_public_f',
      'noteach_se_public_m',
      'noteach_se_private_f',
      'noteach_se_private_m',
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
        "translate($row.dataElement, { noteach_pe_public_f: 'Primary Education (Public)', noteach_pe_public_m: 'Primary Education (Public)', noteach_pe_private_f: 'Primary Education (Private)', noteach_pe_private_m: 'Primary Education (Private)', noteach_se_public_f: 'Secondary Education (Public)', noteach_se_public_m: 'Secondary Education (Public)', noteach_se_private_f: 'Secondary Education (Private)', noteach_se_private_m: 'Secondary Education (Private)' })",
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
      "'Male'":
        'sum([$row.noteach_pe_public_m, $row.noteach_pe_private_m, $row.noteach_se_public_m, $row.noteach_se_private_m])',
      "'Female'":
        'sum([$row.noteach_pe_public_f, $row.noteach_pe_private_f, $row.noteach_se_public_f, $row.noteach_se_private_f])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Primary Education (Public)': 1, 'Primary Education (Private)': 2, 'Secondary Education (Public)': 3, 'Secondary Education (Private)': 4 })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['name', 'Male', 'Female', 'GPI', 'Male_metadata', 'Female_metadata'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Teachers: by Level of Education, Gender, GPI',
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
    },
    Male: {
      chartType: 'bar',
      color: '#f44336',
      stackId: '1',
      yName: 'Number of Students',
      valueType: 'number',
      labelType: 'fraction',
    },
    Female: {
      chartType: 'bar',
      color: '#2196f3',
      stackId: '1',
      valueType: 'number',
      labelType: 'fraction',
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
    await await findSingleRecord(db, 'permission_group', { name: permissionGroup })
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
  const dashboardItemId = (await await findSingleRecord(db, 'dashboard_item', { code })).id;
  const dashboardId = (await await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Staff',
    entityTypes: ['country', 'district', 'sub_district'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
