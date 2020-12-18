'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

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

const countryCode = 'PW';
const projectCode = 'olangch_palau';
const projectName = 'MoH Project Olangch';
const dashboardGroupName = 'General';
const dashboardGroupCode = 'OLANGCH_PALAU_Project';
const dashboardGroupCountryCode = 'PW_Olangch_Country';
const userGroup = 'Donor';

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Project',
    userGroup,
    organisationUnitCode: projectCode,
    dashboardReports: '{project_details}',
    name: dashboardGroupName,
    code: dashboardGroupCode,
    projectCodes: `{${projectCode}}`,
  });
  await insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Country',
    userGroup,
    organisationUnitCode: countryCode,
    dashboardReports: '{project_details}',
    name: dashboardGroupName,
    code: dashboardGroupCountryCode,
    projectCodes: `{${projectCode}}`,
  });
  await insertObject(db, 'entity', {
    id: generateId(),
    code: projectCode,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: projectName,
    type: 'project',
  });

  await insertObject(db, 'entity_hierarchy', {
    id: generateId(),
    name: projectCode,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', projectCode),
    child_id: await codeToId(db, 'entity', countryCode),
    entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
  });
  await insertObject(db, 'project', {
    id: generateId(),
    code: projectCode,
    description: 'HIS for Palau’s public health data, integrating DHIS2 and mSupply.',
    sort_order: 10,
    image_url:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/olangch_palau_background_alt.jpeg',
    default_measure: '126,171',
    dashboard_group_name: dashboardGroupName,
    user_groups: `{${userGroup}}`,
    logo_url: '', // 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/olangch_palau_logo.png',
    entity_id: await codeToId(db, 'entity', projectCode),
    entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, projectCode);

  await db.runSql(
    `DELETE FROM "dashboardGroup" WHERE code IN ('${dashboardGroupCode}', '${dashboardGroupCountryCode}')`,
  );
  await db.runSql(`DELETE FROM project WHERE code = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${projectCode}'`);
};

exports._meta = {
  version: 1,
};
