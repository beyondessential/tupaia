'use strict';

import {
  insertObject,
  deleteObject,
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

const generateIndicator = (code, dataElement, target) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: `${target}`,
    aggregation: { [dataElement]: 'FINAL_EACH_YEAR' },
  },
});

const generateReport = (dataElement, target) => ({
  fetch: {
    dataElements: target ? [dataElement, target] : [dataElement],
    aggregations: ['FINAL_EACH_YEAR'],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'timestamp'": 'periodToTimestamp($row.period)',
      '...': '*',
    },
    {
      transform: 'aggregate',
      timestamp: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'Current'": `$row.${dataElement}/100`,
      "'Target'": target ? `$row.${target}` : 'undefined',
      '...': ['timestamp'],
    },
  ],
});

const FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  yName: 'Rate',
  periodGranularity: 'year',
  valueType: 'percentage',
  chartConfig: {
    Current: {
      color: '#f44336',
    },
    Target: {
      color: '#4caf50',
    },
  },
};

const CONFIG_0_2_REPORT = {
  code: 'LESMIS_enrolment_ece_0_2_target',
  indicator: generateIndicator('er_target_ece_0_2_t', 'er_district_ece_0_2_t', '0.07'),
  reportConfig: generateReport('er_district_ece_0_2_t', 'er_target_ece_0_2_t'),
  frontEndConfig: { ...FRONT_END_CONFIG, name: 'Enrolment rate of 0-2 year old students in ECE' },
};

const CONFIG_3_4_REPORT = {
  code: 'LESMIS_enrolment_ece_3_4_target',
  reportConfig: generateReport('er_district_ece_3_4_t'),
  frontEndConfig: {
    ...FRONT_END_CONFIG,
    name: 'Enrolment rate of 3-4 year old students in ECE',
    chartConfig: { Current: { color: '#f44336' } }, // Remove target from legend, no 2025 target for 3 - 4
  },
};

const CONFIG_5_REPORT = {
  code: 'LESMIS_enrolment_ece_5_target',
  indicator: generateIndicator('er_target_ece_5_t', 'er_district_ece_5_t', '0.86'),
  reportConfig: generateReport('er_district_ece_5_t', 'er_target_ece_5_t'),
  frontEndConfig: { ...FRONT_END_CONFIG, name: 'Enrolment rate of 5 year old students in ECE' },
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
  for (const { code, indicator, reportConfig, frontEndConfig } of [
    CONFIG_0_2_REPORT,
    CONFIG_3_4_REPORT,
    CONFIG_5_REPORT,
  ]) {
    if (indicator) {
      await insertObject(db, 'indicator', indicator);
    }
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code, indicator } of [CONFIG_0_2_REPORT, CONFIG_3_4_REPORT, CONFIG_5_REPORT]) {
    if (indicator) {
      await deleteObject(db, 'indicator', { code: indicator.code });
    }
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
