'use strict';

import { findSingleRecord, findSingleRecordBySql, generateId, insertObject } from '../utilities';

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

const CODE = 'LESMIS_water_supply_school';

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['amenity_water_supply', 'amenity_water_allyear', 'amenity_water_drinking'],
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    {
      transform: 'insertColumns',
      columns: {
        '=$dataElement': '=$value',
      },
    },
    {
      transform: 'updateColumns',
      where: "=eq($dataElement, 'amenity_water_supply')",
      insert: {
        code: 'WaterSupply',
        label: 'Water supply',
        statistic: '=$amenity_water_supply',
        sort_order: '0',
      },
      exclude: ['amenity_water_supply'],
    },
    {
      transform: 'updateColumns',
      where: "=eq($dataElement, 'amenity_water_allyear')",
      insert: {
        code: 'WaterAllYear',
        label: 'Water all year round',
        statistic: '=$amenity_water_allyear',
        sort_order: '1',
      },
      exclude: ['amenity_water_allyear'],
    },
    {
      transform: 'updateColumns',
      where: "=eq($dataElement, 'amenity_water_drinking')",
      insert: {
        code: 'DrinkingWater',
        label: 'Clean drinking water',
        statistic: '=$amenity_water_drinking',
        sort_order: '2',
      },
      exclude: ['amenity_water_drinking'],
    },
    {
      transform: 'sortRows',
      by: 'sort_order',
      direction: 'asc',
    },
    {
      transform: 'excludeColumns',
      columns: ['organisationUnit', 'dataElement', 'value', 'sort_order'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Water Supply',
  type: 'list',
  valueType: 'color',
  periodGranularity: 'one_year_at_a_time',
  listConfig: {
    color: {
      0: { color: '#D13333', label: 'no' },
      1: { color: '#02B851', label: 'yes' },
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    frontEndConfig: FRONT_END_CONFIG,
    reportConfig: REPORT_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_WASH',
    entityTypes: ['school'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = async function (db) {
  await removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
