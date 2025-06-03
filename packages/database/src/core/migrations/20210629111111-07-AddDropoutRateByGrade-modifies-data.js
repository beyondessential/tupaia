'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  arrayToDbString,
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

const BASE_FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'bar',
  yName: 'Dropout Rate',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'percentage',
  chartConfig: {
    Male: {
      color: '#f44336',
      stackId: '1',
      legendOrder: '1',
    },
    Female: {
      color: '#2196f3',
      stackId: '2',
      legendOrder: '2',
    },
    Total: {
      color: '#9c27b0',
      stackId: '3',
      legendOrder: '3',
    },
  },
  presentationOptions: {
    hideAverage: true,
  },
};

const PRIMARY = {
  code: 'LESMIS_dropout_rate_by_grade_primary',
  reportConfig: {
    fetch: {
      dataElements: [
        'dor_district_p1_m',
        'dor_district_p1_f',
        'dor_district_p1_t',
        'dor_district_p2_m',
        'dor_district_p2_f',
        'dor_district_p2_t',
        'dor_district_p3_m',
        'dor_district_p3_f',
        'dor_district_p3_t',
        'dor_district_p4_m',
        'dor_district_p4_f',
        'dor_district_p4_t',
        'dor_district_p5_m',
        'dor_district_p5_f',
        'dor_district_p5_t',
        'dor_district_pe_t',
        'dor_district_pe_f',
        'dor_district_pe_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {  dor_district_p1_m: 'Grade 1', dor_district_p1_f: 'Grade 1', dor_district_p1_t: 'Grade 1', dor_district_p2_m: 'Grade 2', dor_district_p2_f: 'Grade 2', dor_district_p2_t: 'Grade 2', dor_district_p3_m: 'Grade 3', dor_district_p3_f: 'Grade 3', dor_district_p3_t: 'Grade 3', dor_district_p4_m: 'Grade 4', dor_district_p4_f: 'Grade 4', dor_district_p4_t: 'Grade 4', dor_district_p5_m: 'Grade 5', dor_district_p5_f: 'Grade 5', dor_district_p5_t: 'Grade 5', dor_district_pe_t: 'Total', dor_district_pe_f: 'Total', dor_district_pe_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',
        "'Female'":
          'sum([$row.dor_district_p1_f, $row.dor_district_p2_f, $row.dor_district_p3_f, $row.dor_district_p4_f, $row.dor_district_p5_f, $row.dor_district_pe_f]) / 100',
        "'Male'":
          'sum([$row.dor_district_p1_m, $row.dor_district_p2_m, $row.dor_district_p3_m, $row.dor_district_p4_m, $row.dor_district_p5_m, $row.dor_district_pe_m]) / 100',
        "'Total'":
          'sum([$row.dor_district_p1_t, $row.dor_district_p2_t, $row.dor_district_p3_t, $row.dor_district_p4_t, $row.dor_district_p5_t, $row.dor_district_pe_t]) / 100',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  frontEndConfig: {
    name: 'Primary School Dropout Rates',
    ...BASE_FRONT_END_CONFIG,
  },
};

const LOWER_SECONDARY = {
  code: 'LESMIS_dropout_rate_by_grade_lower_secondary',
  reportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s1_t',
        'dor_district_s1_f',
        'dor_district_s1_m',
        'dor_district_s2_t',
        'dor_district_s2_f',
        'dor_district_s2_m',
        'dor_district_s3_t',
        'dor_district_s3_f',
        'dor_district_s3_m',
        'dor_district_s4_t',
        'dor_district_s4_f',
        'dor_district_s4_m',
        'dor_district_lse_t',
        'dor_district_lse_f',
        'dor_district_lse_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s1_t: 'Grade 6', dor_district_s1_f: 'Grade 6', dor_district_s1_m: 'Grade 6', dor_district_s2_t: 'Grade 7', dor_district_s2_f: 'Grade 7', dor_district_s2_m: 'Grade 7', dor_district_s3_t: 'Grade 8', dor_district_s3_f: 'Grade 8', dor_district_s3_m: 'Grade 8', dor_district_s4_t: 'Grade 9', dor_district_s4_f: 'Grade 9', dor_district_s4_m: 'Grade 9', dor_district_lse_t: 'Total', dor_district_lse_f: 'Total', dor_district_lse_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s1_f, $row.dor_district_s2_f, $row.dor_district_s3_f, $row.dor_district_s4_f, $row.dor_district_lse_f])',
        "'Male'":
          'sum([$row.dor_district_s1_m, $row.dor_district_s2_m, $row.dor_district_s3_m, $row.dor_district_s4_m, $row.dor_district_lse_m])',
        "'Total'":
          'sum([$row.dor_district_s1_t, $row.dor_district_s2_t, $row.dor_district_s3_t, $row.dor_district_s4_t, $row.dor_district_lse_t])',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  frontEndConfig: {
    name: 'LSE Dropout Rates',
    ...BASE_FRONT_END_CONFIG,
  },
};

const UPPER_SECONDARY = {
  code: 'LESMIS_dropout_rate_by_grade_upper_secondary',
  reportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s5_t',
        'dor_district_s5_f',
        'dor_district_s5_m',
        'dor_district_s6_t',
        'dor_district_s6_f',
        'dor_district_s6_m',
        'dor_district_s7_t',
        'dor_district_s7_f',
        'dor_district_s7_m',
        'dor_district_use_t',
        'dor_district_use_f',
        'dor_district_use_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s5_t: 'Grade 10', dor_district_s5_f: 'Grade 10', dor_district_s5_m: 'Grade 10', dor_district_s6_t: 'Grade 11', dor_district_s6_f: 'Grade 11', dor_district_s6_m: 'Grade 11', dor_district_s7_t: 'Grade 12', dor_district_s7_f: 'Grade 12', dor_district_s7_m: 'Grade 12', dor_district_use_t: 'Total', dor_district_use_f: 'Total', dor_district_use_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s5_f, $row.dor_district_s6_f, $row.dor_district_s7_f, $row.dor_district_use_f])',
        "'Male'":
          'sum([$row.dor_district_s5_m, $row.dor_district_s6_m, $row.dor_district_s7_m, $row.dor_district_use_m])',
        "'Total'":
          'sum([$row.dor_district_s5_t, $row.dor_district_s6_t, $row.dor_district_s7_t, $row.dor_district_use_t])',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  frontEndConfig: {
    name: 'USE Dropout Rates',
    ...BASE_FRONT_END_CONFIG,
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

const OLD_DASHBOARD_ITEMS = [
  'Laos_Schools_Dropout_Bar_Primary_District',
  'Laos_Schools_Dropout_Bar_Lower_Secondary_District',
  'Laos_Schools_Dropout_Bar_Upper_Secondary_District',
];

exports.up = async function (db) {
  for (const { code, reportConfig, frontEndConfig } of [
    PRIMARY,
    LOWER_SECONDARY,
    UPPER_SECONDARY,
  ]) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LA_Student_Outcomes',
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }

  // delete old dashboard items and legacy reports that were created for Laos Schools (cascades to relations)
  await db.runSql(
    `DELETE FROM dashboard_item WHERE code IN (${arrayToDbString(OLD_DASHBOARD_ITEMS)});`,
  );
  await db.runSql(
    `DELETE FROM legacy_report WHERE code IN (${arrayToDbString(OLD_DASHBOARD_ITEMS)});`,
  );
};

exports.down = async function (db) {
  for (const { code } of [PRIMARY, LOWER_SECONDARY, UPPER_SECONDARY]) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
