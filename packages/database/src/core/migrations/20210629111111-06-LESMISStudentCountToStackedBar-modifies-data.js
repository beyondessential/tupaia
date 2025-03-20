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

const CODE = 'LESMIS_student_gender_stacked_gpi';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'nostu_p1_f',
      'nostu_p1_m',
      'nostu_p2_f',
      'nostu_p2_m',
      'nostu_p3_f',
      'nostu_p3_m',
      'nostu_p4_f',
      'nostu_p4_m',
      'nostu_p5_f',
      'nostu_p5_m',
      'nostu_s1_f',
      'nostu_s1_m',
      'nostu_s2_f',
      'nostu_s2_m',
      'nostu_s3_f',
      'nostu_s3_m',
      'nostu_s4_f',
      'nostu_s4_m',
      'nostu_s5_f',
      'nostu_s5_m',
      'nostu_s6_f',
      'nostu_s6_m',
      'nostu_s7_f',
      'nostu_s7_m',
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
        "translate($row.dataElement, { nostu_p1_f: 'Grade 1', nostu_p1_m: 'Grade 1', nostu_p2_f: 'Grade 2', nostu_p2_m: 'Grade 2', nostu_p3_f: 'Grade 3', nostu_p3_m: 'Grade 3', nostu_p4_f: 'Grade 4', nostu_p4_m: 'Grade 4', nostu_p5_f: 'Grade 5', nostu_p5_m: 'Grade 5', nostu_s1_f: 'Grade 6', nostu_s1_m: 'Grade 6', nostu_s2_f: 'Grade 7', nostu_s2_m: 'Grade 7', nostu_s3_f: 'Grade 8', nostu_s3_m: 'Grade 8', nostu_s4_f: 'Grade 9', nostu_s4_m: 'Grade 9', nostu_s5_f: 'Grade 10', nostu_s5_m: 'Grade 10', nostu_s6_f: 'Grade 11', nostu_s6_m: 'Grade 11', nostu_s7_f: 'Grade 12', nostu_s7_m: 'Grade 12' })",
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
      "'Male'":
        'sum([$row.nostu_p1_m, $row.nostu_p2_m, $row.nostu_p3_m, $row.nostu_p4_m, $row.nostu_p5_m, $row.nostu_s1_m, $row.nostu_s2_m, $row.nostu_s3_m, $row.nostu_s4_m, $row.nostu_s5_m, $row.nostu_s6_m, $row.nostu_s7_m])',
      "'Female'":
        'sum([$row.nostu_p1_f, $row.nostu_p2_f, $row.nostu_p3_f, $row.nostu_p4_f, $row.nostu_p5_f, $row.nostu_s1_f, $row.nostu_s2_f, $row.nostu_s3_f, $row.nostu_s4_f, $row.nostu_s5_f, $row.nostu_s6_f, $row.nostu_s7_f])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      '...': '*',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Students by Gender',
  type: 'chart',
  chartType: 'composed',
  xName: 'Level of Education',
  periodGranularity: 'one_year_at_a_time',
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
      yName: 'Number of Students',
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
  await addItemToDashboard(db, { code, dashboardCode, entityTypes, projectCodes, permissionGroup });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await await findSingleRecord(db, 'dashboard_item', { code })).id;
  const dashboardId = (await await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
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
