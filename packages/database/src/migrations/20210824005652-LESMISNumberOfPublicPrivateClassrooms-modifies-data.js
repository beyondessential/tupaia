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

const generateReport = elements => ({
  fetch: {
    dataElements: [elements.public, elements.private],
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      // Some of these were undefined for 0 at district level, so added a default value just in case
      "'Public'": `exists($row.${elements.public}) ? $row.${elements.public} : 0`,
      "'Private'": `exists($row.${elements.private}) ? $row.${elements.private} : 0`,
      "'timestamp'": 'periodToTimestamp($row.period)',
    },
    {
      transform: 'aggregate',
      timestamp: 'group',
      '...': 'max',
    },
  ],
});

const FRONT_END_CONFIG = {
  name: 'Number of classrooms (Public/Private), ECE',
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  yName: 'Number of Classrooms',
  periodGranularity: 'year',
  valueType: 'number',
  chartConfig: {
    // Standard colors, pulled from similar visual for public/private schools
    Public: {
      color: '#EB7D3C',
      stackId: '1',
    },
    Private: {
      color: '#FDBF2D',
      stackId: '1',
    },
  },
};

const DATA_ELEMENTS_BY_LEVEL = {
  district: {
    public: 'noclassroom_public_ece',
    private: 'noclassroom_private_ece',
  },
  province: {
    public: 'noclassroom_province_public_ece',
    private: 'noclassroom_province_private_ece',
  },
  country: {
    public: 'noclassroom_country_public_ece',
    private: 'noclassroom_country_private_ece',
  },
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_district_classrooms_public_private',
    reportConfig: generateReport(DATA_ELEMENTS_BY_LEVEL.district),
    entityTypes: ['sub_district'],
  },
  {
    code: 'LESMIS_province_classrooms_public_private',
    reportConfig: generateReport(DATA_ELEMENTS_BY_LEVEL.province),
    entityTypes: ['district'],
  },
  {
    code: 'LESMIS_country_classrooms_public_private',
    reportConfig: generateReport(DATA_ELEMENTS_BY_LEVEL.country),
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
  for (const { code, reportConfig, entityTypes } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig: FRONT_END_CONFIG,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
      entityTypes,
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
