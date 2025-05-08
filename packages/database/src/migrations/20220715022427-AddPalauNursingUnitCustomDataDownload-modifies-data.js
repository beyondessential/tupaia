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
/** Card: MAUI-1010
Dashboard Title: Nursing Unit - Data Download
Dashboard Group: Palau Nursing Unit
Dashboard type: Raw data download
Permission Group: Palau Nursing Unit
Countries: Palau
Hierarchy Level: National
Data Source Entity Type: Facility

PW_SW01 - SW01 Surgical Ward Report
PW_ER01 - ER01 Daily Ward Report
PW_ER02 - ER02 Monthly Issues Arising
PW_OR01 - OR01 Monthly OR Report
PW_MW01 - MW01 Medical Ward Report
PW_HD01 - HD01 Hemodialysis Ward Report
*/

const CODE = 'PW_Nursing_Unit_Custom_Raw_Data_Download';
const PERMISSION_GROUP = 'Palau Nursing Unit';
const PROJECT_CODE = 'olangch_palau';
const DASHBOARD_CODE = 'pw_nursing_unit';

const LEGACY_REPORT_CONFIG = {
  surveys: [
    {
      code: 'PW_SW01',
      name: 'Surgical Ward Report',
    },
    {
      code: 'PW_ER01',
      name: 'Daily Ward Report',
    },
    {
      code: 'PW_ER02',
      name: 'Monthly Issues Arising',
    },
    {
      code: 'PW_OR01',
      name: 'Monthly OR Report',
    },
    {
      code: 'PW_MW01',
      name: 'Medical Ward Report',
    },
    {
      code: 'PW_HD01',
      name: 'Hemodialysis Ward Report',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      skipHeader: true,
      surveysConfig: {
        PW_SW01: {
          excludeCodes: [
            'PW_SW01_3',
            'PW_SW01_4',
            'PW_SW01_14',
            'PW_SW01_24',
            'PW_SW01_34',
            'PW_SW01_39',
            'PW_SW01_47',
            'PW_SW01_60',
            'PW_SW01_64',
            'PW_SW01_65',
            'PW_SW01_72',
            'PW_SW01_81',
            'PW_SW01_82',
            'PW_SW01_86',
            'PW_SW01_89',
            'PW_SW01_101',
            'PW_SW01_113',
            'PW_SW01_114',
            'PW_SW01_120',
            'PW_SW01_126',
            'PW_SW01_132',
            'PW_SW01_140',
            'PW_SW01_149',
            'PW_SW01_152',
          ],
          entityAggregation: {
            dataSourceEntityType: 'facility',
          },
        },
        PW_ER01: {
          excludeCodes: ['PW_ER01_39'],
          entityAggregation: {
            dataSourceEntityType: 'facility',
          },
        },
        PW_ER02: {
          excludeCodes: ['PW_ER02_10'],
          entityAggregation: {
            dataSourceEntityType: 'facility',
          },
        },
        PW_OR01: {
          excludeCodes: ['PW_OR01_14', 'PW_OR01_18', 'PW_OR01_20', 'PW_OR01_3'],
          entityAggregation: {
            dataSourceEntityType: 'facility',
          },
        },
        PW_MW01: {
          excludeCodes: [
            'PW_MW01_3',
            'PW_MW01_11',
            'PW_MW01_19',
            'PW_MW01_22',
            'PW_MW01_24',
            'PW_MW01_37',
            'PW_MW01_38',
            'PW_MW01_47',
            'PW_MW01_42',
            'PW_MW01_56',
            'PW_MW01_57',
            'PW_MW01_62',
            'PW_MW01_68',
          ],
          entityAggregation: {
            dataSourceEntityType: 'facility',
          },
        },
        PW_HD01: {
          excludeCodes: [
            'PW_HD01_3',
            'PW_HD01_4',
            'PW_HD01_34',
            'PW_HD01_38',
            'PW_HD01_39',
            'PW_HD01_45',
            'PW_HD01_46',
            'PW_HD01_51',
            'PW_HD01_54',
            'PW_HD01_60',
            'PW_HD01_77',
          ],
          entityAggregation: {
            dataSourceEntityType: 'facility',
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
  name: 'Nursing Unit - Data Download',
  type: 'view',
  viewType: 'dataDownload',
  // periodGranularity: 'year',
};

const REPORT_CONFIG = {
  code: CODE,
  reportConfig: LEGACY_REPORT_CONFIG,
  dataBuilder: 'surveyDataExport',
  frontEndConfig: FRONT_END_CONFIG,
  permissionGroup: PERMISSION_GROUP,
  dashboardCode: DASHBOARD_CODE,
  entityTypes: ['country'],
  projectCodes: [PROJECT_CODE],
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
  await addNewDashboardItemAndLegacyReport(db, REPORT_CONFIG);
};

exports.down = async function (db) {
  await removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
