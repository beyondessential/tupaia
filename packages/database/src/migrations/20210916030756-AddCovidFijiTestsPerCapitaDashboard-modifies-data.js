'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  deleteObject,
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

const INDICATORS = [
  {
    code: 'COVID_FJ_Tests_Per_Sub_District',
    builder: 'analyticArithmetic',
    config: {
      formula: 'BCD46',
      aggregation: {
        BCD46: {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: { dataSourceEntityType: 'facility', aggregationEntityType: 'sub_district' },
        },
      },
    },
  },
  {
    code: 'COVID_FJ_Pop_Sum_Previous_Per_Day',
    builder: 'analyticArithmetic',
    config: {
      formula: 'population_FJ001',
      aggregation: { population_FJ001: 'SUM_PREVIOUS_EACH_DAY' },
    },
  },
];

const generateConfig = () => ({
  code: `FJ_Covid_Tests_Per_100k`,
  reportConfig: {
    fetch: {
      dataElements: ['COVID_FJ_Tests_Per_Sub_District', 'COVID_FJ_Pop_Sum_Previous_Per_Day'],
      aggregations: [
        {
          type: 'RAW',
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
        transform: 'mergeRows',
        groupBy: 'period',
        using: {
          COVID_FJ_Tests_Per_Sub_District: 'sum',
          COVID_FJ_Pop_Sum_Previous_Per_Day: 'sum',
          organisationUnit: 'exclude',
        },
      },
      {
        transform: 'updateColumns',
        insert: {
          Tests: '=$COVID_FJ_Tests_Per_Sub_District',
          Population: '=subset(@all.COVID_FJ_Pop_Sum_Previous_Per_Day, index(1))',
        },
        description:
          'subset(@all.COVID_FJ_Pop_Sum_Previous_Per_Day, index(1)), just takes the first population response (they should all be the same)',
        include: ['period'],
      },
      {
        transform: 'excludeRows',
        where: '=not exists($Tests)',
      },
      {
        transform: 'updateColumns',
        insert: {
          'Tests per 100k': '=$Tests / ($Population / 100000)',
          name: "=periodToDisplayString($period, 'DAY')",
          timestamp: "=periodToTimestamp($period)'",
        },
        include: ['period'],
      },
    ],
  },
  frontEndConfig: {
    name: 'COVID-19 Total tests per capita',
    type: 'chart',
    chartType: 'bar',
    valueType: 'number',
    chartConfig: {
      'Tests per 100k': {
        label: 'Tests per 100k',
      },
    },
    periodGranularity: 'day',
    presentationOptions: {
      hideAverage: 'true',
    },
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
  for (const indicator of INDICATORS) {
    await insertObject(db, 'indicator', { ...indicator, id: generateId() });
    await insertObject(db, 'data_source', {
      id: generateId(),
      code: indicator.code,
      type: 'dataElement',
      service_type: 'indicator',
    });
  }

  const { code, reportConfig, frontEndConfig } = generateConfig();
  await addNewDashboardItemAndReport(db, {
    code,
    reportConfig,
    frontEndConfig,
    permissionGroup: 'Public',
    dashboardCode: 'FJ_COVID-19_Fiji',
    entityTypes: ['sub_district', 'district', 'country'],
    projectCodes: ['supplychain_fiji'],
  });
};

exports.down = async function (db) {
  const { code } = generateConfig();
  await removeDashboardItemAndReport(db, code);

  for (const indicator of INDICATORS) {
    await deleteObject(db, 'indicator', { code: indicator.code });
    await deleteObject(db, 'data_source', { code: indicator.code });
  }
};

exports._meta = {
  version: 1,
};
