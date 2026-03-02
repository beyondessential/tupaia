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

const AMENITIES = ['electricity', 'computer', 'laptop', 'tablet', 'internet', 'tv', 'satellite'];
const EDUCATION_LEVELS = ['ece', 'pe', 'se'];
const ENTITY_LEVELS = ['country', 'province', 'district'];
const ENTITY_LEVEL_MAP = {
  country: 'country',
  province: 'district',
  district: 'sub_district',
};

const REPORT_CONFIG = entityLevel => ({
  fetch: {
    dataElements: [
      ...EDUCATION_LEVELS.flatMap(educationLevel =>
        AMENITIES.map(amenity => `amenity_${entityLevel}_${educationLevel}_${amenity}`),
      ),
      'nosch_ece',
      'nosch_pe',
      'nosch_se',
    ],
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'PreSchoolTotal'": "eq($row.dataElement, 'nosch_ece') ? $row.value : undefined",
      "'PrimaryTotal'": "eq($row.dataElement, 'nosch_pe') ? $row.value : undefined",
      "'SecondaryTotal'": "eq($row.dataElement, 'nosch_se') ? $row.value : undefined",
      '...': '*',
    },
    {
      transform: 'select',
      where:
        'all(notExists($row.PreSchoolTotal), notExists($row.PrimaryTotal), notExists($row.SecondaryTotal))',
      // Since our data element names are so standarized we can split
      // instead of using a giant translate
      "'level'": "$row.dataElement.split('_')[3]",
      "'name'": "$row.dataElement.split('_')[4]",
      '...': '*',
    },
    {
      transform: 'select',
      where:
        'all(notExists($row.PreSchoolTotal), notExists($row.PrimaryTotal), notExists($row.SecondaryTotal))',
      "'PreSchool'": "eq($row.level, 'ece') ? $row.value : undefined",
      "'Primary'": "eq($row.level, 'pe') ? $row.value : undefined",
      "'Secondary'": "eq($row.level, 'se') ? $row.value : undefined",
      '...': '*',
    },
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'last',
    },
    {
      transform: 'select',
      where:
        'all(notExists($row.PreSchoolTotal), notExists($row.PrimaryTotal), notExists($row.SecondaryTotal))',
      "'PreSchool'": '$row.PreSchool / sum($all.PreSchoolTotal)',
      "'PreSchool_metadata'":
        '{ numerator: $row.PreSchool, denominator: sum($all.PreSchoolTotal) }',
      "'Primary'": '$row.Primary / sum($all.PrimaryTotal)',
      "'Primary_metadata'": '{ numerator: $row.Primary, denominator: sum($all.PrimaryTotal) }',
      "'Secondary'": '$row.Secondary / sum($all.SecondaryTotal)',
      "'Secondary_metadata'":
        '{ numerator: $row.Secondary, denominator: sum($all.SecondaryTotal) }',
      '...': ['name'],
    },
    {
      transform: 'filter',
      where:
        'all(notExists($row.PreSchoolTotal), notExists($row.PrimaryTotal), notExists($row.SecondaryTotal))',
    },
  ],
});

// Same for all levels
const FRONT_END_CONFIG = {
  name: 'ICT Facilities, % Availability',
  type: 'chart',
  chartType: 'bar',
  xName: 'Amenity',
  yName: 'Availability',
  periodGranularity: 'one_year_at_a_time',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  chartConfig: {
    PreSchool: {
      color: '#f44336', // Blue
      stackId: '1',
      legendOrder: '1',
    },
    Primary: {
      color: '#2196f3', // Red
      stackId: '2',
      legendOrder: '2',
    },
    Secondary: {
      color: '#9c27b0', // Purple
      stackId: '3',
      legendOrder: '3',
    },
  },
};

const getDashboardConfig = entityLevel => ({
  code: `LESMIS_ICT_amenities_${entityLevel}`,
  reportConfig: REPORT_CONFIG(entityLevel),
  entityTypes: [ENTITY_LEVEL_MAP[entityLevel]],
});

const DASHBOARD_ITEMS = [
  getDashboardConfig('country'),
  getDashboardConfig('province'),
  getDashboardConfig('district'),
];

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
  for (const { code, reportConfig, entityTypes } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig: FRONT_END_CONFIG,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LA_ICT_Facilities',
      entityTypes,
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
