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

const COUNTRY_CODE = 'PW';
const PROJECT_CODE = 'olangch_palau';
const PROJECT_NAME = 'MoH Project Olangch';
const DASHBOARDGROUP_NAME = 'General';
const DASHBOARDGROUP_CODE = 'OLANGCH_PALAU_Project';
const DASHBOARDGROUP_COUNTRY_CODE = 'PW_Olangch_Country';
const USER_GROUP = 'Donor';

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Project',
    userGroup: USER_GROUP,
    organisationUnitCode: PROJECT_CODE,
    dashboardReports: '{project_details}',
    name: DASHBOARDGROUP_NAME,
    code: DASHBOARDGROUP_CODE,
    projectCodes: `{${PROJECT_CODE}}`,
  });
  await insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Country',
    userGroup: USER_GROUP,
    organisationUnitCode: COUNTRY_CODE,
    dashboardReports: '{project_details}',
    name: DASHBOARDGROUP_NAME,
    code: DASHBOARDGROUP_COUNTRY_CODE,
    projectCodes: `{${PROJECT_CODE}}`,
  });
  await insertObject(db, 'entity', {
    id: generateId(),
    code: PROJECT_CODE,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: PROJECT_NAME,
    type: 'project',
  });

  await insertObject(db, 'entity_hierarchy', {
    id: generateId(),
    name: PROJECT_CODE,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', COUNTRY_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
  await insertObject(db, 'project', {
    id: generateId(),
    code: PROJECT_CODE,
    description: 'HIS for Palau’s public health data, integrating DHIS2 and mSupply.',
    sort_order: 10,
    image_url:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/olangch_palau_background_alt.jpeg',
    default_measure: '126,171',
    dashboard_group_name: DASHBOARDGROUP_NAME,
    user_groups: `{${USER_GROUP}}`,
    logo_url: '', // 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/olangch_palau_logo.png',
    entity_id: await codeToId(db, 'entity', PROJECT_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, PROJECT_CODE);

  await db.runSql(
    `DELETE FROM "dashboardGroup" WHERE code IN ('${DASHBOARDGROUP_CODE}', '${DASHBOARDGROUP_COUNTRY_CODE}')`,
  );
  await db.runSql(`DELETE FROM project WHERE code = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${PROJECT_CODE}'`);
};

exports._meta = {
  version: 1,
};
