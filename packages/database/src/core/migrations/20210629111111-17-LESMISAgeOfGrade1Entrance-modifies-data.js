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

const CODE = 'LESMIS_age_of_grade1_entrance';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'lesmis_student_age4_p1_m',
      'lesmis_student_age4_p1_f',
      'lesmis_student_age5_p1_m',
      'lesmis_student_age5_p1_f',
      'lesmis_student_age6_p1_m',
      'lesmis_student_age6_p1_f',
      'lesmis_student_age7_p1_m',
      'lesmis_student_age7_p1_f',
      'lesmis_student_age8_p1_m',
      'lesmis_student_age8_p1_f',
      'lesmis_student_age9_p1_m',
      'lesmis_student_age9_p1_f',
      'lesmis_student_age10_p1_m',
      'lesmis_student_age10_p1_f',
      'lesmis_student_age11_p1_m',
      'lesmis_student_age11_p1_f',
      'lesmis_student_age12_p1_m',
      'lesmis_student_age12_p1_f',
      'lesmis_student_age13_p1_m',
      'lesmis_student_age13_p1_f',
      'lesmis_student_age14_p1_m',
      'lesmis_student_age14_p1_f',
      'lesmis_student_age15_p1_m',
      'lesmis_student_age15_p1_f',
    ],
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'school',
          aggregationEntityType: 'requested',
        },
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, { lesmis_student_age4_p1_m: 'Age 4', lesmis_student_age4_p1_f: 'Age 4', lesmis_student_age5_p1_m: 'Age 5', lesmis_student_age5_p1_f: 'Age 5', lesmis_student_age6_p1_m: 'Age 6', lesmis_student_age6_p1_f: 'Age 6', lesmis_student_age7_p1_m: 'Age 7', lesmis_student_age7_p1_f: 'Age 7', lesmis_student_age8_p1_m: 'Age 8', lesmis_student_age8_p1_f: 'Age 8', lesmis_student_age9_p1_m: 'Age 9', lesmis_student_age9_p1_f: 'Age 9', lesmis_student_age10_p1_m: 'Age 10', lesmis_student_age10_p1_f: 'Age 10', lesmis_student_age11_p1_m: 'Age 11', lesmis_student_age11_p1_f: 'Age 11', lesmis_student_age12_p1_m: 'Age 12', lesmis_student_age12_p1_f: 'Age 12', lesmis_student_age13_p1_m: 'Age 13', lesmis_student_age13_p1_f: 'Age 13', lesmis_student_age14_p1_m: 'Age 14', lesmis_student_age14_p1_f: 'Age 14', lesmis_student_age15_p1_m: 'Age 15', lesmis_student_age15_p1_f: 'Age 15' })",
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
      "'Denominator'":
        'sum([sum($all.lesmis_student_age4_p1_m), sum($all.lesmis_student_age4_p1_f), sum($all.lesmis_student_age5_p1_m), sum($all.lesmis_student_age5_p1_f), sum($all.lesmis_student_age6_p1_m), sum($all.lesmis_student_age6_p1_f), sum($all.lesmis_student_age7_p1_m), sum($all.lesmis_student_age7_p1_f), sum($all.lesmis_student_age8_p1_m), sum($all.lesmis_student_age8_p1_f), sum($all.lesmis_student_age9_p1_m), sum($all.lesmis_student_age9_p1_f), sum($all.lesmis_student_age10_p1_m), sum($all.lesmis_student_age10_p1_f), sum($all.lesmis_student_age11_p1_m), sum($all.lesmis_student_age11_p1_f), sum($all.lesmis_student_age12_p1_m), sum($all.lesmis_student_age12_p1_f), sum($all.lesmis_student_age13_p1_m), sum($all.lesmis_student_age13_p1_f), sum($all.lesmis_student_age14_p1_m), sum($all.lesmis_student_age14_p1_f), sum($all.lesmis_student_age15_p1_m), sum($all.lesmis_student_age15_p1_f)])',
      "'Numerator'":
        'sum([$row.lesmis_student_age4_p1_m, $row.lesmis_student_age4_p1_f, $row.lesmis_student_age5_p1_m, $row.lesmis_student_age5_p1_f, $row.lesmis_student_age6_p1_m, $row.lesmis_student_age6_p1_f, $row.lesmis_student_age7_p1_m, $row.lesmis_student_age7_p1_f, $row.lesmis_student_age8_p1_m, $row.lesmis_student_age8_p1_f, $row.lesmis_student_age9_p1_m, $row.lesmis_student_age9_p1_f, $row.lesmis_student_age10_p1_m, $row.lesmis_student_age10_p1_f, $row.lesmis_student_age11_p1_m, $row.lesmis_student_age11_p1_f, $row.lesmis_student_age12_p1_m, $row.lesmis_student_age12_p1_f, $row.lesmis_student_age13_p1_m, $row.lesmis_student_age13_p1_f, $row.lesmis_student_age14_p1_m, $row.lesmis_student_age14_p1_f, $row.lesmis_student_age15_p1_m, $row.lesmis_student_age15_p1_f])',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Age 4': 1, 'Age 5': 2, 'Age 6': 3, 'Age 7': 4, 'Age 8': 5, 'Age 9': 6, 'Age 10': 7, 'Age 11': 8, 'Age 12': 9, 'Age 13': 10, 'Age 14': 11, 'Age 15': 12 })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      "'Age 4_metadata'":
        "eq($row.name, 'Age 4') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 5_metadata'":
        "eq($row.name, 'Age 5') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 6_metadata'":
        "eq($row.name, 'Age 6') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 7_metadata'":
        "eq($row.name, 'Age 7') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 8_metadata'":
        "eq($row.name, 'Age 8') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 9_metadata'":
        "eq($row.name, 'Age 9') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 10_metadata'":
        "eq($row.name, 'Age 10') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 11_metadata'":
        "eq($row.name, 'Age 11') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 12_metadata'":
        "eq($row.name, 'Age 12') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 13_metadata'":
        "eq($row.name, 'Age 13') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 14_metadata'":
        "eq($row.name, 'Age 14') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'Age 15_metadata'":
        "eq($row.name, 'Age 15') ? { numerator: $row.Numerator, denominator: $row.Denominator } : undefined",
      "'value'": '$row.Numerator/$row.Denominator',
      '...': ['name'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Age of Grade 1 Entrance',
  type: 'chart',
  chartType: 'pie',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'fractionAndPercentage',
  presentationOptions: {
    'Age 4': { color: '#4caf50' },
    'Age 5': { color: '#8bc34a' },
    'Age 6': { color: '#acd042' },
    'Age 7': { color: '#cddc39' },
    'Age 8': { color: '#ffeb3b' },
    'Age 9': { color: '#ffc107' },
    'Age 10': { color: '#ffad04' },
    'Age 11': { color: '#ff9800' },
    'Age 12': { color: '#ff7811' },
    'Age 13': { color: '#ff5722' },
    'Age 14': { color: '#f44336' },
    'Age 15': { color: '#aa2e25' },
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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Student_Enrolment',
    entityTypes: ['country', 'district', 'sub_district'],
    projectCodes: ['laos_schools'],
  });
  await addItemToDashboard(db, {
    code: CODE,
    dashboardCode: 'LA_Students',
    permissionGroup: 'LESMIS Public',
    entityTypes: ['school'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
