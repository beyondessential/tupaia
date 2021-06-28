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

const CODE = 'LESMIS_student_ethnicity';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'nostu_LaoThai_f',
      'nostu_LaoThai_m',
      'nostu_MonKhmer_f',
      'nostu_MonKhmer_m',
      'nostu_ChineseTibetan_f',
      'nostu_ChineseTibetan_m',
      'nostu_HmongMien_f',
      'nostu_HmongMien_m',
      'nostu_Foreigner_f',
      'nostu_Foreigner_m',
      'nostu_Other_f',
      'nostu_Other_m',
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
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, { nostu_LaoThai_f: 'Lao-Thai', nostu_LaoThai_m: 'Lao-Thai', nostu_MonKhmer_f: 'Mon-Khmer', nostu_MonKhmer_m: 'Mon-Khmer', nostu_ChineseTibetan_f: 'Chinese-Tibetan', nostu_ChineseTibetan_m: 'Chinese-Tibetan', nostu_HmongMien_f: 'Hmong-Mien', nostu_HmongMien_m: 'Hmong-Mien', nostu_Foreigner_f: 'Foreigner', nostu_Foreigner_m: 'Foreigner', nostu_Other_f: 'Other', nostu_Other_m: 'Other' })",
      "'Total'":
        'sum([$row.nostu_LaoThai_f, $row.nostu_LaoThai_m, $row.nostu_MonKhmer_f, $row.nostu_MonKhmer_m, $row.nostu_ChineseTibetan_f, $row.nostu_ChineseTibetan_m, $row.nostu_ChineseTibetan_f, $row.nostu_ChineseTibetan_m, $row.nostu_HmongMien_f, $row.nostu_HmongMien_m, $row.nostu_Foreigner_f, $row.nostu_Foreigner_m, $row.nostu_Other_f, $row.nostu_Other_m])',
      '...': '*',
    },
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      "'Lao-Thai_metadata'":
        '{ numerator: sum([$row.nostu_LaoThai_f, $row.nostu_LaoThai_m]), denominator: $row.Total }',
      "'Mon-Khmer_metadata'":
        '{ numerator: sum([$row.nostu_MonKhmer_f, $row.nostu_MonKhmer_m]), denominator: $row.Total }',
      "'Chinese-Tibetan_metadata'":
        '{ numerator: sum([$row.nostu_ChineseTibetan_f, $row.nostu_ChineseTibetan_m]), denominator: $row.Total }',
      "'Hmong-Mien_metadata'":
        '{ numerator: sum([$row.nostu_HmongMien_f, $row.nostu_HmongMien_m]), denominator: $row.Total }',
      "'Foreigner_metadata'":
        '{ numerator: sum([$row.nostu_Foreigner_f, $row.nostu_Foreigner_m]), denominator: $row.Total }',
      "'Other_metadata'":
        '{ numerator: sum([$row.nostu_Other_f, $row.nostu_Other_m]), denominator: $row.Total }',
      "'value'":
        'sum([$row.nostu_LaoThai_f, $row.nostu_LaoThai_m, $row.nostu_MonKhmer_f, $row.nostu_MonKhmer_m, $row.nostu_ChineseTibetan_f, $row.nostu_ChineseTibetan_m, $row.nostu_ChineseTibetan_f, $row.nostu_ChineseTibetan_m, $row.nostu_HmongMien_f, $row.nostu_HmongMien_m, $row.nostu_Foreigner_f, $row.nostu_Foreigner_m, $row.nostu_Other_f, $row.nostu_Other_m])/$row.Total',
      '...': ['name'],
    },
    {
      transform: 'select',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Students by Ethnicity',
  type: 'chart',
  chartType: 'pie',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'fractionAndPercentage',
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
  console.log('Please do something');
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Students',
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
