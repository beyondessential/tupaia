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

const CODE = 'PG_Strive_PNG_Lab_Confirmed_Positive_Results';

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['STR_QMAL05', 'STR_PF05', 'STR_PV05', 'STR_PM05', 'STR_PO05'],
    aggregations: [
      {
        type: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
        config: { aggregationEntityType: 'requested', dataSourceEntityType: 'case' },
      },
    ],
  },
  transform: [
    {
      transform: 'filter',
      where: '$row.value == 1', // 0 indicates negative response, we are only interested in positive responses
    },
    'keyValueByDataElementName',
    'convertPeriodToWeek',
    {
      transform: 'aggregate',
      organisationUnit: 'drop',
      period: 'group',
      '...': 'count',
    },
    {
      transform: 'select',
      "'name'": "periodToDisplayString($row.period, 'WEEK')",
      "'timestamp'": 'periodToTimestamp($row.period)',
      "'Pf+ve'": 'divide($row.STR_PF05,$row.STR_QMAL05)',
      "'Pv+ve'": 'divide($row.STR_PV05,$row.STR_QMAL05)',
      "'PM+ve'": 'divide($row.STR_PM05,$row.STR_QMAL05)',
      "'PO+ve'": 'divide($row.STR_PO05,$row.STR_QMAL05)',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Lab Confirmed Positive Results, Bar Graph',
  type: 'chart',
  chartType: 'bar',
  chartConfig: {
    'Pf+ve': { stackId: 1 },
    'Pv+ve': { stackId: 1 },
    'PM+ve': { stackId: 1 },
    'PO+ve': { stackId: 1 },
  },
  periodGranularity: 'week',
  valueType: 'percentage',
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
  await addItemToDashboard(db, { code, dashboardCode, entityTypes, projectCodes, permissionGroup });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await findSingleRecord(db, 'dashboard_item', { code })).id;
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'STRIVE User',
    dashboardCode: 'PG_STRIVE_PNG',
    entityTypes: ['facility'],
    projectCodes: ['strive'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
