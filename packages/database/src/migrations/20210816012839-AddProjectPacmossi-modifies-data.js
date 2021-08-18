'use strict';

import { codeToId, insertObject, generateId, findSingleRecord, deleteObject } from '../utilities';

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

const countryCodes = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'];

const projectCode = 'pacmossi';
const projectName = 'PacMOSSI';
const projectDescription = 'Pacific Mosquito Surveillance Strengthening for Impact';

const permissionGroups = ['PacMOSSI', 'PacMOSSI Senior'];

const dashboardName = 'Vector Surveillance';

const projectDashboardItemCode = 'project_details';
const projectDashboardCode = `${projectCode}_${projectName}`;

const getCountryDashboardCode = countryCode =>
  `${countryCode}_${projectName}_${dashboardName.split(' ').join('_')}`;

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record?.rows[0].id;
};

const addCountryToProject = async (db, countryCode, entityHierarchyId) => {
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', projectCode),
    child_id: await codeToId(db, 'entity', countryCode),
    entity_hierarchy_id: entityHierarchyId,
  });
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: getCountryDashboardCode(countryCode),
    name: dashboardName,
    root_entity_code: countryCode,
    sort_order: 1,
  });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await findSingleRecord(db, 'dashboard_item', { code })).id;
  const dashboardId = (await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: `{${entityTypes.join(', ')}}`,
    project_codes: `{${projectCodes.join(', ')}}`,
    permission_groups: `{${permissionGroup}}`,
    sort_order: 1,
  });
};

exports.up = async function (db) {
  await insertObject(db, 'entity', {
    id: generateId(),
    code: projectCode,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: projectName,
    type: 'project',
  });

  const entityHierarchyId = generateId();
  await insertObject(db, 'entity_hierarchy', {
    id: entityHierarchyId,
    name: projectCode,
    canonical_types: '{country,district,field_station,larval_habitat}',
  });

  await Promise.all(
    countryCodes.map(countryCode => addCountryToProject(db, countryCode, entityHierarchyId)),
  );

  // insert project dashboard
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: projectDashboardCode,
    name: dashboardName,
    root_entity_code: projectCode,
    sort_order: 1,
  });

  // insert relations for project_details dashboard item
  await addItemToDashboard(db, {
    code: projectDashboardItemCode,
    dashboardCode: projectDashboardCode,
    permissionGroup: `${permissionGroups[0]}`,
    entityTypes: ['project'],
    projectCodes: [`${projectCode}`],
  });

  await insertObject(db, 'project', {
    id: generateId(),
    code: projectCode,
    description: projectDescription,
    sort_order: 15,
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/PacMOSSI_Background.JPG',
    default_measure: '126,171',
    user_groups: `{${permissionGroups[0]}, ${permissionGroups[1]}}`,
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/PacMossi_Logo.jpg',
    entity_id: await codeToId(db, 'entity', projectCode),
    entity_hierarchy_id: entityHierarchyId,
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, projectCode);

  for (const countryCode of countryCodes) {
    await deleteObject(db, 'dashboard', { code: getCountryDashboardCode(countryCode) });
  }

  const projectDashboardId = (
    await findSingleRecord(db, 'dashboard', { code: projectDashboardCode })
  ).id;
  await deleteObject(db, 'dashboard_relation', { dashboard_id: projectDashboardId });
  await deleteObject(db, 'dashboard', { code: projectDashboardCode });

  await db.runSql(`DELETE FROM project WHERE code = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${projectCode}'`);
};

exports._meta = {
  version: 1,
};
