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

const CODE = 'LESMIS_num_schools_by_district';

const REPORT_CONFIG = {
  fetch: {
    dataGroups: ['LESMIS_NOSch_District'],
    dataElements: [
      'nosch_type1_private',
      'nosch_type1_public',
      'nosch_type2_private',
      'nosch_type2_public',
      'nosch_type3_private',
      'nosch_type3_public',
      'nosch_type4_private',
      'nosch_type4_public',
      'nosch_type5_private',
      'nosch_type5_public',
      'nosch_type6_private',
      'nosch_type6_public',
      'nosch_type7_private',
      'nosch_type7_public',
      'nosch_type8_private',
      'nosch_type8_public',
    ],
    aggregations: [
      {
        type: 'RAW',
        config: {
          dataSourceEntityType: 'sub_district',
        },
      },
    ],
  },
  transform: [
    {
      transform: 'aggregate',
      orgUnitName: 'group',
      orgUnit: 'drop',
      event: 'drop',
      eventDate: 'drop',
      '...': 'sum',
    },
    {
      transform: 'select',
      "'Nursery'": 'sum([$row.nosch_type1_private, $row.nosch_type1_public])',
      "'Kindergarten'": 'sum([$row.nosch_type2_private, $row.nosch_type2_public])',
      "'Nursery and kindergarten'": 'sum([$row.nosch_type3_private, $row.nosch_type3_public])',
      "'Primary (Incomplete)'": 'sum([$row.nosch_type4_private, $row.nosch_type4_public])',
      "'Primary (Complete)'": 'sum([$row.nosch_type5_private, $row.nosch_type5_public])',
      "'LSE'": 'sum([$row.nosch_type6_private, $row.nosch_type6_public])',
      "'USE'": 'sum([$row.nosch_type7_private, $row.nosch_type7_public])',
      "'SE (Complete)'": 'sum([$row.nosch_type8_private, $row.nosch_type8_public])',
      "'name'": '$row.orgUnitName',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Schools by District',
  type: 'chart',
  chartType: 'bar',
  xName: 'District',
  yName: 'Number of Schools',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'number',
  chartConfig: {
    Nursery: {
      color: '#A45628',
      stackId: '1',
      legendOrder: 1,
    },
    Kindergarten: {
      color: '#BC632E',
      stackId: '1',
      legendOrder: 2,
    },
    'Nursery and kindergarten': {
      color: '#D06E34',
      stackId: '1',
      legendOrder: 3,
    },
    'Primary (Incomplete)': {
      color: '#E27839',
      stackId: '1',
      legendOrder: 4,
    },
    'Primary (Complete)': {
      color: '#EC8C5E',
      stackId: '1',
      legendOrder: 5,
    },
    LSE: {
      color: '#EFA78D',
      stackId: '1',
      legendOrder: 6,
    },
    USE: {
      color: '#F3BDAB',
      stackId: '1',
      legendOrder: 7,
    },
    'SE (Complete)': {
      color: '#F6D1C5',
      stackId: '1',
      legendOrder: 8,
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
  return addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Schools',
    entityTypes: ['district'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
