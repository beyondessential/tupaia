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

const LEVEL_TITLES = {
  primary: 'Primary Education',
  lowerSecondary: 'Lower Secondary Education',
  upperSecondary: 'Upper Secondary Education',
};

const DATA_ELEMENT_TRANSLATIONS = {
  primary: {
    rr_district_p1_m: 'Grade 1',
    rr_district_p1_f: 'Grade 1',
    rr_district_p1_t: 'Grade 1',
    rr_district_p2_m: 'Grade 2',
    rr_district_p2_f: 'Grade 2',
    rr_district_p2_t: 'Grade 2',
    rr_district_p3_m: 'Grade 3',
    rr_district_p3_f: 'Grade 3',
    rr_district_p3_t: 'Grade 3',
    rr_district_p4_m: 'Grade 4',
    rr_district_p4_f: 'Grade 4',
    rr_district_p4_t: 'Grade 4',
    rr_district_p5_m: 'Grade 5',
    rr_district_p5_f: 'Grade 5',
    rr_district_p5_t: 'Grade 5',
    rr_district_pe_m: 'Total',
    rr_district_pe_f: 'Total',
    rr_district_pe_t: 'Total',
  },
  lowerSecondary: {
    rr_district_s1_m: 'Grade 6',
    rr_district_s1_f: 'Grade 6',
    rr_district_s1_t: 'Grade 6',
    rr_district_s2_m: 'Grade 7',
    rr_district_s2_f: 'Grade 7',
    rr_district_s2_t: 'Grade 7',
    rr_district_s3_m: 'Grade 8',
    rr_district_s3_f: 'Grade 8',
    rr_district_s3_t: 'Grade 8',
    rr_district_s4_m: 'Grade 9',
    rr_district_s4_f: 'Grade 9',
    rr_district_s4_t: 'Grade 9',
    rr_district_lse_m: 'Total',
    rr_district_lse_f: 'Total',
    rr_district_lse_t: 'Total',
  },
  upperSecondary: {
    rr_district_s5_m: 'Grade 10',
    rr_district_s5_f: 'Grade 10',
    rr_district_s5_t: 'Grade 10',
    rr_district_s6_m: 'Grade 11',
    rr_district_s6_f: 'Grade 11',
    rr_district_s6_t: 'Grade 11',
    rr_district_s7_m: 'Grade 12',
    rr_district_s7_f: 'Grade 12',
    rr_district_s7_t: 'Grade 12',
    rr_district_use_m: 'Total',
    rr_district_use_f: 'Total',
    rr_district_use_t: 'Total',
  },
};

const generateConfigForLevel = level => ({
  code: `LESMIS_repetition_rate_${level}_district`,
  reportConfig: {
    fetch: {
      dataElements: Object.keys(DATA_ELEMENT_TRANSLATIONS[level]),
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
        "'name'": `translate($row.dataElement, ${JSON.stringify(
          DATA_ELEMENT_TRANSLATIONS[level],
        )})`,
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
        "'Male'": `sum([${Object.keys(DATA_ELEMENT_TRANSLATIONS[level])
          .filter(de => de.endsWith('_m'))
          .map(de => `$row.${de}`)
          .join(', ')}]) / 100`,
        "'Female'": `sum([${Object.keys(DATA_ELEMENT_TRANSLATIONS[level])
          .filter(de => de.endsWith('_f'))
          .map(de => `$row.${de}`)
          .join(', ')}]) / 100`,
        "'Total'": `sum([${Object.keys(DATA_ELEMENT_TRANSLATIONS[level])
          .filter(de => de.endsWith('_t'))
          .map(de => `$row.${de}`)
          .join(', ')}]) / 100`,
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  frontEndConfig: {
    name: `Repetition rate in ${LEVEL_TITLES[level]}`,
    type: 'chart',
    chartType: 'bar',
    xName: 'Grade',
    yName: 'Rate',
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
  },
});

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

const LEGACY_DASHBOARD_ITEMS = [
  'Laos_Schools_Repeaters_Bar_Primary_District',
  'Laos_Schools_Repeaters_Bar_Lower_Secondary_District',
  'Laos_Schools_Repeaters_Bar_Upper_Secondary_District',
];

exports.up = async function (db) {
  // drop the old repeat rate visualisations
  for (const code of LEGACY_DASHBOARD_ITEMS) {
    await deleteObject(db, 'legacy_report', { code });
    await deleteObject(db, 'dashboard_item', { code }); // cascades to dashboard_relation
  }

  for (const level of Object.keys(LEVEL_TITLES)) {
    const { code, reportConfig, frontEndConfig } = generateConfigForLevel(level);
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
};

exports.down = async function (db) {
  for (const level of Object.keys(LEVEL_TITLES)) {
    const { code } = generateConfigForLevel(level);
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
