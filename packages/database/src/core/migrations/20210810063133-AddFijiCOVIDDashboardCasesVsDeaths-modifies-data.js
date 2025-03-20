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

const INDICATOR = {
  code: 'COVID_FJ_Positive_Tests_By_Sub_District',
  builder: 'analyticArithmetic',
  config: {
    formula: 'COVIDTest_FJPosTest',
    aggregation: {
      COVIDTest_FJPosTest: {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'facility',
          aggregationEntityType: 'sub_district',
        },
      },
    },
  },
};

const generateConfig = () => ({
  code: `FJ_Covid_Cases_Vs_Deaths`,
  reportConfig: {
    fetch: {
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
      dataElements: ['COVIDDeath_FJNumDeaths', 'COVID_FJ_Positive_Tests_By_Sub_District'],
    },
    transform: [
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        organisationUnit: 'drop',
        period: 'group',
        COVIDDeath_FJNumDeaths: 'sum',
        COVID_FJ_Positive_Tests_By_Sub_District: 'sum',
      },
      {
        transform: 'select',
        "'Deaths'": '$row.COVIDDeath_FJNumDeaths',
        "'Cases'": '$row.COVID_FJ_Positive_Tests_By_Sub_District',
        "'name'": "periodToDisplayString($row.period, 'DAY')",
        "'timestamp'": 'periodToTimestamp($row.period)',
      },
    ],
  },
  frontEndConfig: {
    name: 'Net confirmed cases vs deaths (Daily)',
    type: 'chart',
    chartType: 'composed',
    chartConfig: {
      Cases: {
        color: '#FFD700',
        label: 'Net Confirmed Cases',
        yName: 'Net Confirmed Cases',
        chartType: 'line',
        yAxisOrientation: 'right',
      },
      Deaths: {
        color: '#2194F9',
        label: 'Deaths',
        yName: 'Deaths',
        chartType: 'bar',
        yAxisDomain: {
          max: {
            type: 'scale',
            value: 2,
          },
          min: {
            type: 'number',
            value: 0,
          },
        },
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
  // const indicator = generateIndicator();
  await insertObject(db, 'indicator', { ...INDICATOR, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR.code,
    type: 'dataElement',
    service_type: 'indicator',
  });

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
  await deleteObject(db, 'indicator', { code: INDICATOR.code });
  await deleteObject(db, 'data_source', { code: INDICATOR.code });

  const { code } = generateConfig();
  await removeDashboardItemAndReport(db, code);
};

exports._meta = {
  version: 1,
};
