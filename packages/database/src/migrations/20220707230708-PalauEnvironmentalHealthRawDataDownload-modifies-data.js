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

const CODE = 'PW_Environmental_Health_Custom_Raw_Data_Download';
const PERMISSION_GROUP = 'Palau Environmental Health';
const PROJECT_CODE = 'olangch_palau';

const LEGACY_REPORT_CONFIG = {
  surveys: [
    {
      code: 'PW_EH01',
      name: 'Household Mapping',
    },
    {
      code: 'PW_EH02',
      name: 'Environmental Health Inspection Report',
    },
    {
      code: 'PW_EH03',
      name: 'Dengue Investigation',
    },
    {
      code: 'PW_EH04',
      name: 'Lepto Investigation',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      skipHeader: true,
      surveysConfig: {
        PW_EH01: {
          mergeRowKey: 'PW_EH01_005',
          columnLabels: {
            PW_EH01_002: 'Hamlet',
          },
          entityIdToNameElements: ['PW_EH01_002'],
          excludeCodes: ['PW_EH01_001'],
          entityAggregation: {
            dataSourceEntityType: 'household',
          },
        },
        PW_EH04: {
          mergeRowKey: 'PW_EH04_3',
          columnLabels: {
            PW_EH04_2: 'Hamlet',
          },
          entityIdToNameElements: ['PW_EH04_2'],
          excludeCodes: [
            'PW_EH04_4',
            'PW_EH04_5',
            'PW_EH04_5_d',
            'PW_EH04_12',
            'PW_EH04_13',
            'PW_EH04_13_d',
            'PW_EH04_18',
            'PW_EH04_19',
            'PW_EH04_19_e',
            'PW_EH04_28',
            'PW_EH04_36',
            'PW_EH04_37',
            'PW_EH04_39_a',
            'PW_EH04_42',
            'PW_EH04_43',
            'PW_EH04_44_a',
            'PW_EH04_51',
            'PW_EH04_59',
            'PW_EH04_66',
            'PW_EH04_71',
          ],
          entityAggregation: {
            dataSourceEntityType: 'household',
          },
        },
        PW_EH02: {
          mergeRowKey: 'PW_EH02_4',
          columnLabels: {
            PW_EH02_3: 'Hamlet',
          },
          entityIdToNameElements: ['PW_EH02_3'],
          excludeCodes: [
            'PW_EH02_15',
            'PW_EH02_22',
            'PW_EH02_26',
            'PW_EH02_31',
            'PW_EH02_42',
            'PW_EH02_78',
            'PW_EH02_85',
            'PW_EH02_89',
            'PW_EH02_94',
            'PW_EH02_105',
            'PW_EH02_141',
            'PW_EH02_148',
            'PW_EH02_152',
            'PW_EH02_157',
            'PW_EH02_168',
            'PW_EH02_204',
            'PW_EH02_211',
            'PW_EH02_215',
            'PW_EH02_220',
            'PW_EH02_231',
            'PW_EH02_267',
            'PW_EH02_274',
            'PW_EH02_278',
            'PW_EH02_283',
            'PW_EH02_294',
            'PW_EH02_330',
            'PW_EH02_337',
            'PW_EH02_341',
            'PW_EH02_346',
            'PW_EH02_357',
            'PW_EH02_393',
            'PW_EH02_400',
            'PW_EH02_404',
            'PW_EH02_409',
            'PW_EH02_420',
            'PW_EH02_456',
            'PW_EH02_463',
            'PW_EH02_467',
            'PW_EH02_472',
            'PW_EH02_483',
            'PW_EH02_519',
            'PW_EH02_526',
            'PW_EH02_530',
            'PW_EH02_535',
            'PW_EH02_546',
            'PW_EH02_582',
            'PW_EH02_589',
            'PW_EH02_593',
            'PW_EH02_598',
            'PW_EH02_609',
            'PW_EH02_637',
            'PW_EH02_638',
            'PW_EH02_692',
            'PW_EH02_718',
            'PW_EH02_719',
            'PW_EH02_730',
            'PW_EH02_737',
            'PW_EH02_744',
          ],
          entityAggregation: {
            dataSourceEntityType: 'household',
          },
        },
        PW_EH03: {
          mergeRowKey: 'PW_EH03_4',
          columnLabels: {
            PW_EH03_3: 'Hamlet',
          },
          entityIdToNameElements: ['PW_EH03_3'],
          excludeCodes: [
            'PW_EH03_6',
            'PW_EH03_17',
            'PW_EH03_18',
            'PW_EH03_34',
            'PW_EH03_44',
            'PW_EH03_86',
            'PW_EH03_100',
          ],
          entityAggregation: {
            dataSourceEntityType: 'household',
          },
        },
      },
      transformations: [
        {
          type: 'transposeMatrix',
        },
      ],
    },
  },
};

const FRONT_END_CONFIG = {
  name: 'Download Raw Data',
  type: 'view',
  viewType: 'dataDownload',
  // periodGranularity: 'year',
};

const DASHBOARD_CONFIG = {
  code: 'PW_environmental_health',
  name: 'Environmental Health',
  rootEntityCode: PROJECT_CODE,
};

const REPORT_CONFIG = {
  code: CODE,
  reportConfig: LEGACY_REPORT_CONFIG,
  dataBuilder: 'surveyDataExport',
  frontEndConfig: FRONT_END_CONFIG,
  permissionGroup: PERMISSION_GROUP,
  dashboardCode: DASHBOARD_CONFIG.code,
  entityTypes: ['country'],
  projectCodes: [PROJECT_CODE],
};

const addNewDashboard = async (db, { code, name, rootEntityCode }) => {
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code,
    name,
    root_entity_code: rootEntityCode,
  });
};

const removeDashboard = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard WHERE code = '${code}';`);
};

// Util functions adjusted for legacy report
const addNewDashboardItemAndLegacyReport = async (
  db,
  {
    code,
    frontEndConfig,
    dataBuilder,
    reportConfig,
    permissionGroup,
    dashboardCode,
    entityTypes,
    projectCodes,
  },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'legacy_report', {
    id: reportId,
    code,
    data_builder: dataBuilder,
    data_builder_config: reportConfig,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code,
    config: frontEndConfig,
    report_code: code,
    legacy: true,
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
  await db.runSql(`DELETE FROM legacy_report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  await addNewDashboard(db, DASHBOARD_CONFIG);
  await addNewDashboardItemAndLegacyReport(db, REPORT_CONFIG);
  await db.runSql(`
    UPDATE project
    SET permission_groups = array_append(permission_groups, '${PERMISSION_GROUP}')
    WHERE code = '${PROJECT_CODE}'
    `);
};

exports.down = async function (db) {
  await removeDashboardItemAndReport(db, CODE);
  await removeDashboard(db, DASHBOARD_CONFIG.code);
  await db.runSql(`
    UPDATE project
    SET permission_groups = array_remove(permission_groups, '${PERMISSION_GROUP}')
    WHERE code = '${PROJECT_CODE}'
  `);
};

exports._meta = {
  version: 1,
};
