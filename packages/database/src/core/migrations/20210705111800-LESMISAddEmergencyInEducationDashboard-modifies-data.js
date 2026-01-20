'use strict';

import {
  generateId,
  insertObject,
  deleteObject,
  findSingleRecord,
  findSingleRecordBySql,
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

const DASHBOARD_LIST = [
  {
    name: 'Basic Emergency/Disaster Information',
    code: 'LESMIS_EmergencyInEducation_Basic_Information',
    sort_order: 0,
  },
  {
    name: 'Loss Teaching & Learning Materials',
    code: 'LESMIS_EmergencyInEducation_Teaching_Learning_Materials',
    sort_order: 1,
  },
  {
    name: 'Teaching-Learning Continuity',
    code: 'LESMIS_EmergencyInEducation_Teaching_Learning_Continuity',
    sort_order: 2,
  },
  {
    name: 'WASH Affected',
    code: 'LESMIS_EmergencyInEducation_WASH_Affected',
    sort_order: 3,
  },
];

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await findSingleRecord(db, 'dashboard_item', { code })).id;
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

exports.up = async function (db) {
  for (const { name, code, sort_order } of DASHBOARD_LIST) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      code,
      name,
      root_entity_code: 'LA',
      sort_order,
    });
    await addItemToDashboard(db, {
      code: 'no_data_at_level',
      dashboardCode: code,
      permissionGroup: 'LESMIS Public',
      entityTypes: ['country', 'district', 'sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_LIST) {
    const dashboardId = (await findSingleRecord(db, 'dashboard', { code })).id;
    await deleteObject(db, 'dashboard_relation', { dashboard_id: dashboardId });
    await deleteObject(db, 'dashboard', { code });
  }
};

exports._meta = {
  version: 1,
};
