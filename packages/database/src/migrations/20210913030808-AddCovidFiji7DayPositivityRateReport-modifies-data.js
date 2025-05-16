'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
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

const generateConfig = () => ({
  code: `FJ_Covid_7_Day_Positivity_Rate`,
  reportConfig: {
    fetch: {
      aggregations: [
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
      dataElements: ['COVID_FJ_7_Day_Rolling_Pos_Tests', 'COVID_FJ_7_Day_Rolling_Num_Tests'],
    },

    transform: [
      'keyValueByDataElementName',
      {
        transform: 'mergeRows',
        groupBy: 'period',
        using: {
          COVID_FJ_7_Day_Rolling_Num_Tests: 'sum',
          COVID_FJ_7_Day_Rolling_Pos_Tests: 'sum',
          '*': 'exclude',
        },
      },
      {
        transform: 'excludeRows',
        where:
          '=not(exists($COVID_FJ_7_Day_Rolling_Num_Tests)) or $COVID_FJ_7_Day_Rolling_Num_Tests <= 0',
      },
      {
        transform: 'updateColumns',
        insert: {
          value: '=$COVID_FJ_7_Day_Rolling_Pos_Tests / $COVID_FJ_7_Day_Rolling_Num_Tests',
          name: "=periodToDisplayString($period, 'DAY')",
          timestamp: '=periodToTimestamp($period)',
          value_metadata:
            '={numerator: $COVID_FJ_7_Day_Rolling_Pos_Tests, denominator: $COVID_FJ_7_Day_Rolling_Num_Tests}',
        },
        exclude: '*',
      },
    ],
  },
  frontEndConfig: {
    name: '7 day rolling test positivity rate',
    type: 'chart',
    chartType: 'line',
    valueType: 'percentage',
    labelType: 'fractionAndPercentage',
    chartConfig: {
      value: {
        color: '#FFD700',
        label: 'Positivity Rate',
        yName: 'Positivity Rate',
      },
    },
    periodGranularity: 'day',
  },
});

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
  const { code, reportConfig, frontEndConfig } = generateConfig();
  await addNewDashboardItemAndReport(db, {
    code,
    reportConfig,
    frontEndConfig,
    permissionGroup: 'BES Admin',
    dashboardCode: 'FJ_COVID-19_Fiji',
    entityTypes: ['sub_district', 'district', 'country'],
    projectCodes: ['supplychain_fiji'],
  });
};

exports.down = async function (db) {
  const { code } = generateConfig();
  await removeDashboardItemAndReport(db, code);
};

exports._meta = {
  version: 1,
};
