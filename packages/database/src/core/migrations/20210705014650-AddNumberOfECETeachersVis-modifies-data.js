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

const CODE = 'LESMIS_Number_of_Teachers_ECE';

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['noteach_ece_public_m', 'noteach_ece_public_f'],
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
        config: {
          dataSourceEntityType: 'sub_district',
        },
      },
    ],
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
      "'Male'": '$row.noteach_ece_public_m',
      "'Female'": '$row.noteach_ece_public_f',
      '...': ['timestamp'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      '...': '*',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Teachers (Public), ECE',
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  periodGranularity: 'year',
  chartConfig: {
    GPI: {
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
    },
    Male: {
      color: '#f44336',
      yAxisOrientation: 'left',
      yName: 'Number of Teachers',
    },
    Female: {
      color: '#2196f3',
      yAxisOrientation: 'left',
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
  const dashboardId = (await await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
  const maxSortOrder = (
    await findSingleRecordBySql(
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
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
