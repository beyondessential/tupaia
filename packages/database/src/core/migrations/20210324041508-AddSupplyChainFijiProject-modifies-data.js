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

const countryCodes = ['FJ'];
const projectCode = 'supplychain_fiji';
const projectName = 'Fiji Supply Chain';
const projectDescription = 'Strengthening health supply chains in Fiji';

const dashboardGroupName = 'COVID-19 Fiji';
const userGroups = ['Donor'];

const imageUrl =
  'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/supplychain_fiji_background.png';
const logoUrl = 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/supplychain_fiji_logo.png';

const getCountryDashboardGroupCode = (countryCode, userGroup) =>
  `${countryCode}_SUPPLYCHAIN_FIJI_Country_${userGroup.split(' ').join('_')}`;

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}';`);
  return record?.rows[0].id;
};

const addCountryToProject = async (db, countryCode) => {
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', projectCode),
    child_id: await codeToId(db, 'entity', countryCode),
    entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
  });
  await Promise.all(
    userGroups.map(userGroup =>
      insertObject(db, 'dashboardGroup', {
        organisationLevel: 'Country',
        userGroup,
        organisationUnitCode: countryCode,
        dashboardReports: '{}',
        name: dashboardGroupName,
        code: getCountryDashboardGroupCode(countryCode, userGroup),
        projectCodes: `{${projectCode}}`,
      }),
    ),
  );
};

exports.up = async function (db) {
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
    canonical_types: '{country,district,village,facility}',
  });

  await Promise.all(countryCodes.map(countryCode => addCountryToProject(db, countryCode)));

  await insertObject(db, 'project', {
    id: generateId(),
    code: projectCode,
    description: projectDescription,
    sort_order: 12,
    image_url: imageUrl,
    default_measure: '126,171',
    dashboard_group_name: dashboardGroupName,
    user_groups: `{${userGroups[0]}}`,
    logo_url: logoUrl,
    entity_id: await codeToId(db, 'entity', projectCode),
    entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, projectCode);

  await db.runSql(`DELETE FROM "dashboardGroup" WHERE name = '${dashboardGroupName}'`);
  await db.runSql(`DELETE FROM project WHERE code = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${projectCode}'`);
};

exports._meta = {
  version: 1,
};
