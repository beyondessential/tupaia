'use strict';

import { insertObject, generateId, findSingleRecord, deleteObject } from '../utilities';

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

const DASHBOARD_CODE = 'LESMIS_International_SDGs_students';
const CODE = 'LESMIS_percent_children_over_age';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'oafg_district_pe_f',
      'oafg_district_pe_m',
      'oafg_district_pe_t',
      'oafg_district_lse_f',
      'oafg_district_lse_m',
      'oafg_district_lse_t',
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
        "translate($row.dataElement, { oafg_district_pe_f: 'Primary', oafg_district_pe_m: 'Primary', oafg_district_pe_t: 'Primary', oafg_district_lse_f: 'Lower Secondary', oafg_district_lse_m: 'Lower Secondary', oafg_district_lse_t: 'Lower Secondary' })",
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
      "'Female'": 'sum([$row.oafg_district_pe_f, $row.oafg_district_lse_f])',
      "'Male'": 'sum([$row.oafg_district_pe_m, $row.oafg_district_lse_m])',
      "'Total'": 'sum([$row.oafg_district_pe_t, $row.oafg_district_lse_t])',
      '...': ['name'],
    },
    {
      transform: 'sort',
      by: '$row.name',
      descending: true,
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Percentage of children over-age for grade',
  type: 'chart',
  chartType: 'bar',
  xName: 'Level of Education',
  yName: '%',
  periodGranularity: 'one_year_at_a_time',
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
  const dashboardId = (
    await findSingleRecord(db, `SELECT id FROM dashboard WHERE code = '${dashboardCode}'`)
  ).id;
  const maxSortOrder = (
    await findSingleRecord(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;
  await await insertObject(db, 'dashboard_relation', {
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
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: 'Students',
    root_entity_code: 'LA',
  });
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: DASHBOARD_CODE,
    entityTypes: ['sub_district'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = async function (db) {
  await removeDashboardItemAndReport(db, CODE);
  await deleteObject(db, 'dashboard', { code: DASHBOARD_CODE });
};

exports._meta = {
  version: 1,
};
