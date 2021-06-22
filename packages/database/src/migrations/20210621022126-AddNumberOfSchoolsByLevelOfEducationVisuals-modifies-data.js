'use strict';

import { insertObject, generateId, findSingleRecord } from '../utilities';

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

const CODE = 'LESMIS_num_schools_by_education_level';

const REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'nosch_type1_private',
      'nosch_type1_public',
      'nosch_type2_private',
      'nosch_type2_public',
      'nosch_type3_private',
      'nosch_type3_public',
      'nosch_type4_private',
      'nosch_type4_public',
      'nosch_type5_private',
      'nosch_type5_public',
      'nosch_type6_private',
      'nosch_type6_public',
      'nosch_type7_private',
      'nosch_type7_public',
      'nosch_type8_private',
      'nosch_type8_public',
    ],
    aggregations: [
      {
        type: 'MOST_RECENT',
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
    {
      transform: 'select',
      "'name'":
        "translate($row.dataElement, {nosch_type1_private: 'Pre-Schools', nosch_type1_public: 'Pre-Schools', nosch_type2_private: 'Pre-Schools', nosch_type2_public: 'Pre-Schools', nosch_type3_private: 'Pre-Schools', nosch_type3_public: 'Pre-Schools', nosch_type4_private: 'Primary Schools', nosch_type4_public: 'Primary Schools', nosch_type5_private: 'Primary Schools', nosch_type5_public: 'Primary Schools',nosch_type6_private: 'Secondary Schools', nosch_type6_public: 'Secondary Schools', nosch_type7_private: 'Secondary Schools', nosch_type7_public: 'Secondary Schools', nosch_type8_private: 'Secondary Schools', nosch_type8_public: 'Secondary Schools'})",
      '...': ['value'],
    },
    {
      transform: 'aggregate',
      name: 'group',
      '...': 'sum',
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Number of Schools by Level of Education',
  type: 'chart',
  chartType: 'bar',
  xName: 'Level of Education',
  yName: 'Number of Schools',
  periodGranularity: 'one_year_at_a_time',
};

const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, `SELECT id FROM permission_group WHERE name = '${permissionGroup}';`)
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
  const dashboardId = (
    await findSingleRecord(db, `SELECT id FROM dashboard WHERE code = '${dashboardCode}'`)
  ).id;
  const maxSortOrder = (
    await findSingleRecord(
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

exports.up = async function (db) {
  return addNewDashboardItemAndReport(db, {
    code: CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LA_Schools',
    entityTypes: ['country', 'district', 'sub_district'],
    projectCodes: ['laos_schools'],
  });
};

const removeNewDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.down = function (db) {
  return removeNewDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
