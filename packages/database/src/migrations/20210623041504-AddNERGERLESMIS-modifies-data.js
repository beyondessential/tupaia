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

const LESMIS_ENTITY_LEVELS = ['country', 'province', 'district'];
const TUPAIA_ENTITY_LEVELS = ['country', 'district', 'sub_district'];
const ENROLMENT_RATE_ACRONYMS = ['ner', 'ger'];
const ENROLMENT_RATE_TITLES = ['Net Enrolment Rate - NER', 'Gross Enrolment Rate - GER'];

const CODE = 'LESMIS_enrolment_rate_acronym_lesmis_entity_level';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'enrolment_rate_acronym_lesmis_entity_level_pe_t',
      'enrolment_rate_acronym_lesmis_entity_level_pe_f',
      'enrolment_rate_acronym_lesmis_entity_level_pe_m',
      'enrolment_rate_acronym_lesmis_entity_level_lse_t',
      'enrolment_rate_acronym_lesmis_entity_level_lse_f',
      'enrolment_rate_acronym_lesmis_entity_level_lse_m',
      'enrolment_rate_acronym_lesmis_entity_level_use_t',
      'enrolment_rate_acronym_lesmis_entity_level_use_f',
      'enrolment_rate_acronym_lesmis_entity_level_use_m',
    ],
    aggregations: [
      {
        type: 'MOST_RECENT',
        config: {
          dataSourceEntityType: 'tupaia_entity_level',
        },
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, { enrolment_rate_acronym_lesmis_entity_level_pe_t: 'Primary', enrolment_rate_acronym_lesmis_entity_level_pe_f: 'Primary', enrolment_rate_acronym_lesmis_entity_level_pe_m: 'Primary', enrolment_rate_acronym_lesmis_entity_level_lse_t: 'Lower Secondary', enrolment_rate_acronym_lesmis_entity_level_lse_f: 'Lower Secondary', enrolment_rate_acronym_lesmis_entity_level_lse_m: 'Lower Secondary', enrolment_rate_acronym_lesmis_entity_level_use_t: 'Upper Secondary', enrolment_rate_acronym_lesmis_entity_level_use_f: 'Upper Secondary', enrolment_rate_acronym_lesmis_entity_level_use_m: 'Upper Secondary' })",
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
        'sum([$row.enrolment_rate_acronym_lesmis_entity_level_pe_m, $row.enrolment_rate_acronym_lesmis_entity_level_lse_m, $row.enrolment_rate_acronym_lesmis_entity_level_use_m]) / 100',
      "'Female'":
        'sum([$row.enrolment_rate_acronym_lesmis_entity_level_pe_f, $row.enrolment_rate_acronym_lesmis_entity_level_lse_f, $row.enrolment_rate_acronym_lesmis_entity_level_use_f]) / 100',
      "'Total'":
        'sum([$row.enrolment_rate_acronym_lesmis_entity_level_pe_t, $row.enrolment_rate_acronym_lesmis_entity_level_lse_t, $row.enrolment_rate_acronym_lesmis_entity_level_use_t]) / 100',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Primary': 1', 'Lower Secondary': '2', 'Upper Secondary': '3' })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['name', 'Male', 'Female', 'Total', 'GPI'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'enrolment_rate_title (by level of education and gender, GPI)',
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
      legendOrder: '4',
    },
    Male: {
      chartType: 'bar',
      color: '#f44336',
      yName: 'Rate (%)',
      stackId: '1',
      legendOrder: '1',
      valueType: 'percentage',
    },
    Female: {
      chartType: 'bar',
      color: '#2196f3',
      stackId: '2',
      legendOrder: '2',
      valueType: 'percentage',
    },
    Total: {
      chartType: 'bar',
      color: '#9c27b0',
      stackId: '3',
      legendOrder: '3',
      valueType: 'percentage',
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
  const baseConfigString = JSON.stringify({
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Student_Enrolment',
    entityTypes: ['tupaia_entity_level'],
    projectCodes: ['laos_schools'],
  });

  const configs = LESMIS_ENTITY_LEVELS.flatMap((lesmisEntityLevel, i) => {
    const tupaiaEntityLevel = TUPAIA_ENTITY_LEVELS[i];

    // replace entity level placeholders in config
    const entityLevelsReplaced = baseConfigString
      .replace(/lesmis_entity_level/g, lesmisEntityLevel)
      .replace(/tupaia_entity_level/g, tupaiaEntityLevel);

    // replace enrolment rate placeholders in config
    return ENROLMENT_RATE_ACRONYMS.map((acronym, j) => {
      const title = ENROLMENT_RATE_TITLES[j];
      return entityLevelsReplaced
        .replace(/enrolment_rate_acronym/g, acronym)
        .replace(/enrolment_rate_title/g, title);
    });
  }).map(configString => JSON.parse(configString));

  for (const config of configs) {
    await addNewDashboardItemAndReport(db, config);
  }
};

exports.down = async function (db) {
  for (const lesmisEntityLevel of LESMIS_ENTITY_LEVELS) {
    for (const acronym of ENROLMENT_RATE_ACRONYMS) {
      await removeDashboardItemAndReport(
        db,
        CODE.replace('lesmis_entity_level', lesmisEntityLevel).replace(
          'enrolment_rate_acronym',
          acronym,
        ),
      );
    }
  }
};

exports._meta = {
  version: 1,
};
