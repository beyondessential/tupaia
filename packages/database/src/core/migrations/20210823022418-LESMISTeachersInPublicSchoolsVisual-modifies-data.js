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

const DASHBOARD_CODE = 'LESMIS_ESSDP_PrimarySubSector_Staff';

const DATA_ELEMENTS = {
  district: { male: 'noteach_pe_public_m', female: 'noteach_pe_public_f' },
  province: { male: 'noteach_province_pe_public_m', female: 'noteach_province_pe_public_f' },
  country: { male: 'noteach_country_pe_public_m', female: 'noteach_country_pe_public_f' },
};

const generateReportConfig = entityLevel => ({
  fetch: {
    dataElements: [DATA_ELEMENTS[entityLevel].male, DATA_ELEMENTS[entityLevel].female],
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'aggregate',
      period: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'Male'": `$row.${DATA_ELEMENTS[entityLevel].male}`,
      "'Female'": `$row.${DATA_ELEMENTS[entityLevel].female}`,
      '...': '*',
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      "'name'": '$row.period',
      '...': ['Male', 'Female'],
    },
  ],
});

const FRONT_END_CONFIG = {
  name: 'Number of Teachers (Public Schools)',
  type: 'chart',
  chartType: 'composed',
  xName: 'Year',
  periodGranularity: 'year',
  chartConfig: {
    GPI: {
      chartType: 'line',
      color: '#ffeb3b',
      yAxisOrientation: 'right',
      yName: 'GPI',
    },
    Male: {
      chartType: 'bar',
      labelType: 'fraction',
      color: '#f44336',
      stackId: '1',
      yName: 'Number of Teachers',
      valueType: 'number',
    },
    Female: {
      chartType: 'bar',
      labelType: 'fraction',
      color: '#2196f3',
      stackId: '1',
      valueType: 'number',
    },
  },
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_district_public_school_teachers',
    reportConfig: generateReportConfig('district'),
    entityTypes: ['sub_district'],
  },
  {
    code: 'LESMIS_province_public_school_teachers',
    reportConfig: generateReportConfig('province'),
    entityTypes: ['district'],
  },
  {
    code: 'LESMIS_country_public_school_teachers',
    reportConfig: generateReportConfig('country'),
    entityTypes: ['country'],
  },
];

// Same util functions as always
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
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: 'Staff',
    root_entity_code: 'LA',
  });
  for (const { code, reportConfig, entityTypes } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig: FRONT_END_CONFIG,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_ESSDP_PrimarySubSector_Staff',
      entityTypes,
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
  await deleteObject(db, 'dashboard', { code: DASHBOARD_CODE });
};

exports._meta = {
  version: 1,
};
