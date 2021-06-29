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

const NEW_DASHBOARD_CODES = [
  'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
  'LESMIS_ESSDP_UpperSecondarySubSector_Schools',
];

const TITLE_LEVELS = {
  ece: 'ECE',
  primary: 'Primary Education',
  lowerSecondary: 'LSE (incl. combined)',
  upperSecondary: 'USE (incl. combined)',
};

const DASHBOARD_CODES_BY_LEVEL = {
  ece: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
  primary: 'LESMIS_ESSDP_PrimarySubSector_Schools',
  lowerSecondary: 'LESMIS_ESSDP_LowerSecondarySubSector_Schools',
  upperSecondary: 'LESMIS_ESSDP_UpperSecondarySubSector_Schools',
};

const DATA_ELEMENTS_BY_LEVEL = {
  ece: [
    'nosch_type1_private',
    'nosch_type1_public',
    'nosch_type2_private',
    'nosch_type2_public',
    'nosch_type3_private',
    'nosch_type3_public',
  ],
  primary: [
    'nosch_type4_private',
    'nosch_type4_public',
    'nosch_type5_private',
    'nosch_type5_public',
  ],
  lowerSecondary: [
    'nosch_type6_private',
    'nosch_type6_public',
    'nosch_type8_private',
    'nosch_type8_public',
  ],
  upperSecondary: [
    'nosch_type7_private',
    'nosch_type7_public',
    'nosch_type8_private',
    'nosch_type8_public',
  ],
};

const generateConfigForLevel = level => ({
  code: `LESMIS_num_schools_public_private_${level}`,
  dashboardCode: DASHBOARD_CODES_BY_LEVEL[level],
  reportConfig: {
    fetch: {
      dataElements: DATA_ELEMENTS_BY_LEVEL[level],
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
        "'Public'": `sum([${DATA_ELEMENTS_BY_LEVEL[level]
          .filter(de => de.includes('public'))
          .map(de => `$row.${de}`)
          .join(', ')}])`,
        "'Private'": `sum([${DATA_ELEMENTS_BY_LEVEL[level]
          .filter(de => de.includes('private'))
          .map(de => `$row.${de}`)
          .join(', ')}])`,
        '...': ['timestamp'],
      },
    ],
  },
  frontEndConfig: {
    name: `Number of Schools (Public/Private), ${TITLE_LEVELS[level]}`,
    type: 'chart',
    chartType: 'line',
    xName: 'Year',
    yName: 'Number of Schools',
    periodGranularity: 'year',
    valueType: 'number',
    chartConfig: {
      Public: {
        color: '#EB7D3C',
        stackId: '1',
      },
      Private: {
        color: '#FDBF2D',
        stackId: '1',
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
  for (const code of NEW_DASHBOARD_CODES) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      code,
      name: 'Schools',
      root_entity_code: 'LA',
    });
  }
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
  for (const code of NEW_DASHBOARD_CODES) {
    await deleteObject(db, 'dashboard', { code });
  }
};

exports._meta = {
  version: 1,
};
