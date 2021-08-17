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

const countryCodes = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'VU'];

const projectCode = 'pacmossi';
const projectName = 'PacMOSSI';
const projectDescription = 'Pacific Mosquito Surveillance Strengthening for Impact';

const userGroups = ['PacMOSSI', 'PacMOSSI Senior'];

const dashboardName = 'Vector Surveillance';

const getCountryDashboardCode = (countryCode, userGroup) =>
  `${countryCode}_PacMOSSI_Country_${userGroup.split(' ').join('_')}`;

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
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
      insertObject(db, 'dashboard', {
        id: generateId(),
        code: getCountryDashboardCode(countryCode, userGroup),
        name: dashboardName,
        root_entity_code: countryCode,
        sort_order: 1,
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
  });

  await Promise.all(countryCodes.map(countryCode => addCountryToProject(db, countryCode)));

  await insertObject(db, 'project', {
    id: generateId(),
    code: projectCode,
    description: projectDescription,
    sort_order: 16,
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/PacMOSSI_Background.JPG',
    default_measure: '126,171',
    user_groups: `{${userGroups[0]}}`,
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/PacMossi_Logo.jpg',
    entity_id: await codeToId(db, 'entity', projectCode),
    entity_hierarchy_id: await hierarchyNameToId(db, projectCode),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, projectCode);

  for (const countryCode of countryCodes) {
    for (const userGroup of userGroups) {
      await db.runSql(
        `DELETE FROM "dashboard" WHERE code = '${getCountryDashboardCode(countryCode, userGroup)}'`,
      );
    }
  }
  await db.runSql(`DELETE FROM project WHERE code = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${projectCode}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${projectCode}'`);
};

exports._meta = {
  version: 1,
};
