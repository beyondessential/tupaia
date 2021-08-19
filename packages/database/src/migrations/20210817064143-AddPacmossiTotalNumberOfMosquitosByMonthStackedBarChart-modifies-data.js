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

const CODE = 'PMOS_Total_Mosquitos_Per_Month';
const COUNTRIES = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'];
const getDashboardCode = country => `${country}_PacMOSSI_Vector_Surveillance`;

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['PMOS_Anopheles', 'PMOS_Aedes', 'PMOS_Culex', 'PMOS_Mansonia'],
    aggregations: [
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: { dataSourceEntityType: 'field_station', aggregationEntityType: 'requested' },
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'Total'": '$row.value',
      '...': '*',
    },
    'keyValueByDataElementName',
    {
      transform: 'aggregate',
      period: 'group',
      organisationUnit: 'drop',
      '...': 'sum',
    },
    {
      transform: 'select',
      "'Anopheles'": 'divide($row.PMOS_Anopheles, $row.Total)',
      "'Anopheles_metadata'": '{ numerator: $row.PMOS_Anopheles, denominator: $row.Total}',
      "'Aedes'": 'divide($row.PMOS_Aedes, $row.Total)',
      "'Aedes_metadata'": '{ numerator: $row.PMOS_Aedes, denominator: $row.Total}',
      "'Culex'": 'divide($row.PMOS_Culex, $row.Total)',
      "'Culex_metadata'": '{ numerator: $row.PMOS_Culex, denominator: $row.Total}',
      "'Mansonia'": 'divide($row.PMOS_Mansonia, $row.Total)',
      "'Mansonia_metadata'": '{ numerator: $row.PMOS_Mansonia, denominator: $row.Total}',
      "'name'": "periodToDisplayString($row.period, 'MONTH')",
      "'timestamp'": 'periodToTimestamp($row.period)',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Adult mosquitoes collected per month by genus',
  type: 'chart',
  chartType: 'bar',
  xName: 'Month',
  periodGranularity: 'month',
  defaultTimePeriod: {
    start: {
      unit: 'year',
      offset: -1,
    },
  },
  valueType: 'percentage',
  labelType: 'fractionAndPercentage',
  chartConfig: {
    $all: {
      stackId: 1,
    },
    Anopheles: {
      color: '#2196f3',
    },
    Aedes: {
      color: '#f44336',
    },
    Culex: {
      color: '#ff9800',
    },
    Mansonia: {
      color: '#9c27b0',
    },
  },
};

const removeDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  const entityTypes = ['country', 'district'];
  const projectCodes = ['pacmossi'];
  const permissionGroup = 'PacMOSSI';

  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'report', {
    id: reportId,
    code: CODE,
    config: REPORT_CONFIG,
    permission_group_id: permissionGroupId,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: CODE,
    config: FRONT_END_CONFIG,
    report_code: CODE,
  });

  await Promise.all(
    COUNTRIES.map(async country => {
      const dashboardCode = getDashboardCode(country);
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
    }),
  );
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
