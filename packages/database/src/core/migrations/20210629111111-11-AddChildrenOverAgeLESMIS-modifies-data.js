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

const DASHBOARD_CODE = 'LESMIS_International_SDGs_students';

const getReportConfig = educationLevelAcronym => `
{
  "fetch": {
    "aggregations": [
      {
        "type": "MOST_RECENT",
        "config": {
          "dataSourceEntityType": "sub_district"
        }
      }
    ],
    "dataElements": [
      "oafg_district_${educationLevelAcronym}_f",
      "oafg_district_${educationLevelAcronym}_m",
      "oafg_district_${educationLevelAcronym}_t"
    ]
  },
  "transform": [
    "keyValueByDataElementName",
    {
      "transform": "select",
      "'timestamp'": "periodToTimestamp($row.period)",
      "...": "*"
    },
    {
      "transform": "aggregate",
      "timestamp": "group",
      "...": "last"
    },
    {
      "transform": "select",
      "'Female'": "$row.oafg_district_${educationLevelAcronym}_f/100",
      "'Male'": "$row.oafg_district_${educationLevelAcronym}_m/100",
      "'Total'": "$row.oafg_district_${educationLevelAcronym}_t/100",
      "...": ["timestamp"]
    }
  ]
}
`;

const getFrontEndConfig = educationLevel => `
{
  "name": "Percentage of children over-age for grade (${educationLevel})",
  "type": "chart",
  "chartType": "line",
  "xName": "Year",
  "yName": "%",
  "periodGranularity": "one_year_at_a_time",
  "valueType": "percentage",
  "ticks": [0,0.25,0.5,0.75,1],
  "chartConfig": {
    "Male": {
      "color": "#f44336",
      "legendOrder": "1"
    },
    "Female": {
      "color": "#2196f3",
      "legendOrder": "2"
    },
    "Total": {
      "color": "#9c27b0",
      "legendOrder": "3"
    }
  },
  "presentationOptions": {
    "hideAverage": true
  }
}
`;

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

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_percent_children_over_age_pe',
    educationLevel: 'Primary',
    educationLevelAcronym: 'pe',
  },
  {
    code: 'LESMIS_percent_children_over_age_lse',
    educationLevel: 'LSE',
    educationLevelAcronym: 'lse',
  },
];

exports.up = async function (db) {
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_CODE,
    name: 'Students',
    root_entity_code: 'LA',
  });

  for (const { code, educationLevel, educationLevelAcronym } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig: getReportConfig(educationLevelAcronym),
      frontEndConfig: getFrontEndConfig(educationLevel),
      permissionGroup: 'LESMIS Public',
      dashboardCode: DASHBOARD_CODE,
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
  await deleteObject(db, 'dashboard', { code: DASHBOARD_CODE });
};

exports._meta = {
  version: 1,
};
