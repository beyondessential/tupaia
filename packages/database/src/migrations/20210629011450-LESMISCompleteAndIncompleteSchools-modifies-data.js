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

const CODE = 'LESMIS_complete_and_incomplete_schools';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
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
        type: 'MOST_RECENT',
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
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, { nosch_type4_private: 'Primary', nosch_type4_public: 'Primary', nosch_type5_private: 'Primary', nosch_type5_public: 'Primary', nosch_type6_private: 'Secondary', nosch_type6_public: 'Secondary', nosch_type7_private: 'Secondary', nosch_type7_public: 'Secondary', nosch_type8_private: 'Secondary', nosch_type8_public: 'Secondary' })",
      '...': ['value', 'dataElement'],
    },
    'keyValueByDataElementName',
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'sum',
    },
    {
      transform: 'select',
      "'Complete'":
        'sum([$row.nosch_type5_public, $row.nosch_type5_private, $row.nosch_type8_public, $row.nosch_type8_private])',
      "'Incomplete'":
        'sum([$row.nosch_type4_public, $row.nosch_type4_private, $row.nosch_type6_public, $row.nosch_type6_private, $row.nosch_type7_public, $row.nosch_type7_private])',
      "'Total'":
        'sum([$row.nosch_type5_public, $row.nosch_type5_private, $row.nosch_type8_public, $row.nosch_type8_private, $row.nosch_type4_public, $row.nosch_type4_private, $row.nosch_type6_public, $row.nosch_type6_private, $row.nosch_type7_public, $row.nosch_type7_private])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'Complete'": '$row.Complete/$row.Total',
      "'Complete_metadata'": '{ numerator: $row.Complete, denominator: $row.Total }',
      "'Incomplete'": '$row.Incomplete/$row.Total',
      "'Incomplete_metadata'": '{ numerator: $row.Incomplete, denominator: $row.Total }',
      '...': ['name'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Complete and Incomplete Schools',
  type: 'chart',
  chartType: 'bar',
  xName: 'Level of Education',
  yName: 'Schools (%)',
  periodGranularity: 'one_year_at_a_time',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  chartConfig: {
    Complete: {
      color: '#FDBF2D',
      stackId: '1',
    },
    Incomplete: {
      color: '#EB7D3C',
      stackId: '1',
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
