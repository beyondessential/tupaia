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

const AMENITIES = [
  { name: 'amenity_electricity', description: 'Available electricity' },
  { name: 'amenity_computer', description: 'Functioning computer' },
  { name: 'amenity_laptop', description: 'Functioning laptop' },
  { name: 'amenity_tablet', description: 'Functioning tablet' },
  { name: 'amenity_internet', description: 'Internet connection' },
  { name: 'amenity_tv', description: 'Function TV used for teaching and learning' },
  { name: 'amenity_satellite', description: 'Lao satellite receiver and dish set' },
];

const CODE = 'LESMIS_ICT_amenities_school';

const REPORT_CONFIG = {
  fetch: {
    dataElements: AMENITIES.map(amenity => amenity.name),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    // Using inserts so the list rows will exist even if there's no data for them
    ...AMENITIES.map(amenity => ({
      transform: 'insert',
      where: 'eq($index, length($table))',
      "'label'": `'${amenity.description}'`,
      "'code'": `'${amenity.name}'`,
      // Will either equal the one instance of this data, or undefined (no data)
      "'statistic'": `sum($all.${amenity.name})`,
    })),
    // Filter out the original data rows
    {
      transform: 'filter',
      where: 'exists($row.label)',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'ICT Facilities',
  type: 'list',
  valueType: 'color',
  periodGranularity: 'one_year_at_a_time',
  listConfig: {
    1: { color: '#02B851', label: 'Yes' }, // Green
    0: { color: '#D13333', label: 'No' }, // Red
  },
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
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_ICT_Facilities',
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
