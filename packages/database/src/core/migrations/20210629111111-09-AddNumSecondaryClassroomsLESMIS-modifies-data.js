'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  deleteObject,
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

const DASHBOARD_CODE = 'LESMIS_ESSDP_LowerSecondarySubSector_Schools';
const CODE = 'LESMIS_num_lower_secondary_classrooms';

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['noclassroom_public_lse', 'noclassroom_private_lse'],
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
        config: {
          dataSourceEntityType: 'sub_district',
        },
      },
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'Lower Secondary Education (Public)'": '$row.noclassroom_public_lse',
      "'Lower Secondary Education (Private)'": '$row.noclassroom_private_lse',
      "'timestamp'": 'periodToTimestamp($row.period)',
    },
    {
      transform: 'aggregate',
      timestamp: 'group',
      '...': 'last',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Lower Secondary Education Classrooms',
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  yName: 'Number of Classrooms',
  periodGranularity: 'year',
  valueType: 'number',
  chartConfig: {
    'Lower Secondary Education (Public)': {
      color: '#EB7D3C',
    },
    'Lower Secondary Education (Private)': {
      color: '#FDBF2D',
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
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: 'Schools',
    root_entity_code: 'LA',
  });
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: DASHBOARD_CODE,
    entityTypes: ['country', 'district', 'sub_district'],
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
