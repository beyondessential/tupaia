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

const CODE = 'TO_COVID_Contact_Tracing_national';

const REPORT_CONFIG = {
  fetch: {
    aggregations: [
      {
        type: 'MOST_RECENT',
        config: {
          dataSourceEntityType: 'case',
        },
      },
    ],
    dataElements: [
      'TO_C19CRF112',
      'TO_C19CLF22',
      'TO_C19CLF16',
      'TO_C19CLF10',
      'TO_C19CLF26',
      'TO_FCF_06',
      'TO_FCF_05',
      'TO_C19CLF02',
    ],
  },
  output: {
    type: 'matrix',
    columns: [
      'Last Contact with Case',
      'Last Contacted',
      'Phone Number',
      'Vaccination Status',
      'Symptomatic',
      'Status',
    ],
    rowField: 'Contacts',
    categoryField: 'Case',
  },
  transform: [
    'keyValueByDataElementName',
    {
      using: 'single',
      groupBy: ['organisationUnit', 'period'],
      transform: 'mergeRows',
    },
    {
      insert: {
        Case:
          "=exists($TO_C19CRF112) ? $TO_C19CRF112 : exists($TO_C19CLF02) ? orgUnitIdToCode($TO_C19CLF02) : 'Case not found'",
        Status: '=$TO_FCF_05',
        Contacts: '=exists($TO_C19CLF22) ? $TO_C19CLF22 : $organisationUnit',
        Symptomatic: "=translate($TO_FCF_06, {'0': 'No', '1': 'Yes'})",
        'Phone Number': '=$TO_C19CLF10',
        'Last Contacted': '=periodToDisplayString($period)',
        'Vaccination Status': '=$TO_C19CLF26',
        'Last Contact with Case':
          '=exists($TO_C19CLF16) ? periodToDisplayString(dateStringToPeriod($TO_C19CLF16)) : undefined',
      },
      exclude: '*',
      transform: 'updateColumns',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Contact Tracing',
  type: 'matrix',
};

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
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'COVID-19 Senior',
    dashboardCode: 'TO_COVID-19',
    entityTypes: ['country'],
    projectCodes: ['fanafana'],
  });
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
