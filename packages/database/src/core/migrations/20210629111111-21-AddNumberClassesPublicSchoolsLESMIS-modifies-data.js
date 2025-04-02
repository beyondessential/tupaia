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

const COLORS_BY_LEVEL = {
  primary: [
    '#9c27b0',
    '#AF259D',
    '#C3238A',
    '#D62076',
    '#e91e63',
    '#EF2C53',
    '#F43B43',
    '#FA4932',
    '#ff5722',
    '#FF671A',
    '#FF7811',
    '#FF8809',
    '#ff9800',
    '#FFA202',
    '#FFAD04',
    '#FFB705',
    '#ffc107',
  ],
  lowerSecondary: ['#e91e63', '#ff5722', '#ff9800', '#ffc107'],
  upperSecondary: ['#e91e63', '#ff5722', '#ff9800'],
};

const DASHBOARD_CODES_BY_LEVEL = {
  primary: 'LESMIS_ESSDP_PrimarySubSector_Schools',
  lowerSecondary: 'LESMIS_ESSDP_LowerSecondarySubSector_Schools',
  upperSecondary: 'LESMIS_ESSDP_UpperSecondarySubSector_Schools',
};

const DATA_ELEMENT_TO_SERIES_BY_LEVEL = {
  primary: {
    noclassroom_public_pg: 'Playgroup',
    noclassroom_public_p0: 'Pre-primary',
    noclassroom_public_p1: 'Primary 1',
    noclassroom_public_p2: 'Primary 2',
    noclassroom_public_p3: 'Primary 3',
    noclassroom_public_p4: 'Primary 4',
    noclassroom_public_p5: 'Primary 5',
    noclassroom_public_p01: 'Pre-primary + Primary 1',
    noclassroom_public_p12: 'Primary 1 + 2',
    noclassroom_public_p23: 'Primary 2 + 3',
    noclassroom_public_p34: 'Primary 3 + 4',
    noclassroom_public_p45: 'Primary 4 + 5',
    noclassroom_public_p123: 'Primary 1 + 2 + 3',
    noclassroom_public_p234: 'Primary 2 + 3 + 4',
    noclassroom_public_p345: 'Primary 3 + 4 + 5',
    noclassroom_public_pother: 'Primary other',
  },
  lowerSecondary: {
    noclassroom_public_s1: 'Secondary 1',
    noclassroom_public_s2: 'Secondary 2',
    noclassroom_public_s3: 'Secondary 3',
    noclassroom_public_s4: 'Secondary 4',
  },
  upperSecondary: {
    noclassroom_public_s5: 'Secondary 5',
    noclassroom_public_s6: 'Secondary 6',
    noclassroom_public_s7: 'Secondary 7',
  },
};

const generateConfigForLevel = level => ({
  code: `LESMIS_num_classes_public_schools_${level}`,
  dashboardCode: DASHBOARD_CODES_BY_LEVEL[level],
  reportConfig: {
    fetch: {
      dataElements: Object.keys(DATA_ELEMENT_TO_SERIES_BY_LEVEL[level]),
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
        {
          type: 'SUM_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
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
        ...Object.entries(DATA_ELEMENT_TO_SERIES_BY_LEVEL[level]).reduce(
          (serieses, [dataElement, series]) => ({
            ...serieses,
            [`'${series}'`]: `$row.${dataElement}`,
          }),
          {},
        ),
        '...': ['timestamp'],
      },
    ],
  },
  frontEndConfig: {
    name: `Number of Classes in Public Schools`,
    type: 'chart',
    chartType: 'line',
    xName: 'Year',
    yName: 'Number of Classes',
    periodGranularity: 'year',
    valueType: 'number',
    chartConfig: Object.values(DATA_ELEMENT_TO_SERIES_BY_LEVEL[level]).reduce(
      (seriesConfigs, series, index) => ({
        ...seriesConfigs,
        [series]: {
          color: COLORS_BY_LEVEL[level][index],
          legendOrder: index,
        },
      }),
      {},
    ),
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

exports.up = async function (db) {
  for (const level of Object.keys(DASHBOARD_CODES_BY_LEVEL)) {
    const { code, reportConfig, frontEndConfig, dashboardCode } = generateConfigForLevel(level);
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode,
      entityTypes: ['country', 'district', 'sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const level of Object.keys(DASHBOARD_CODES_BY_LEVEL)) {
    const { code } = generateConfigForLevel(level);
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
