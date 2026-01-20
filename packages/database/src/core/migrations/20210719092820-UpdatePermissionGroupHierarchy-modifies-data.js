'use strict';

import { reduceToDictionary } from '@tupaia/utils';
import { arrayToDbString, updateValues } from '../utilities';

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

const newPermissionGroupParents = {
  // 'Name':'Parent'
  Admin: 'BES Project Admin',
  'AMR Laos': 'BES Project Admin',
  'Citizen Scientist Solomon Islands': 'BES Project Admin',
  'COVID-19 Senior': 'COVID-19 Samoa Admin',
  'Demo Land Schools User': 'BES Project Admin',
  EPI: 'Immunisation Admin',
  'FETP Graduates': 'FETP Admin',
  'Fiji Data Collection': 'WISH Admin',
  'Fiji Restricted Data': 'WISH Admin',
  'Fiji Supply Chain - Senior': 'Supply Chain Fiji Admin',
  Hidden: 'BES Data Admin',
  'International Health Regulations': 'BES Project Admin',
  'Laos EOC User': 'Laos EOC Admin',
  // 'Laos Schools Super User': 'Laos Schools Admin',
  'mSupply API Client': 'BES Data Admin',
  'Nauru NCD': 'Nauru eHealth Admin',
  'Nauru Test': 'BES Data Admin',
  'PacMOSSI Senior': 'PacMOSSI Admin',
  PSSS: 'PSSS Admin',
  'PSSS Tupaia': 'PSSS Admin',
  'SPAR Survey': 'BES Data Admin',
  'Strive PNG Laboratory': 'STRIVE Admin',
  'STRIVE Super User': 'STRIVE Admin',
  'Survey Beta Tester': 'BES Data Admin',
  Tamanu: 'BES Data Admin',
  'Tonga Public Health Heads': 'Fanafana Ola Admin',
  UNFPA: 'UNFPA Admin',
};
const oldPermissionGroupParents = {
  Admin: null,
  'AMR Laos': null,
  'Citizen Scientist Solomon Islands': null,
  'COVID-19 Senior': 'Admin',
  'Demo Land Schools User': null,
  EPI: 'Admin',
  'FETP Graduates': 'Admin',
  'Fiji Data Collection': 'Fiji Restricted Data',
  'Fiji Restricted Data': 'Admin',
  'Fiji Supply Chain - Senior': 'Admin',
  Hidden: null,
  'International Health Regulations': null,
  'Laos EOC User': 'Admin',
  'mSupply API Client': null,
  'Nauru NCD': 'Donor',
  'Nauru Test': null,
  'PacMOSSI Senior': 'Admin',
  PSSS: 'Admin',
  'PSSS Tupaia': 'Admin',
  'SPAR Survey': null,
  'Strive PNG Laboratory': 'Admin',
  'STRIVE Super User': 'Admin',
  'Survey Beta Tester': null,
  Tamanu: null,
  'Tonga Public Health Heads': 'Admin',
  UNFPA: 'Admin',
};

const getPermissionGroupIds = async (db, names) => {
  const record = await db.runSql(
    `select id, name from "permission_group" WHERE name in (${arrayToDbString(names)});`,
  );
  return reduceToDictionary(record.rows, 'name', 'id');
};

const updatePermissionGroupParents = (db, permissionGroups, parentDictionary) => {
  const permissionGroupParentIds = {};
  Object.keys(permissionGroups).forEach(pg => {
    permissionGroupParentIds[pg] = parentDictionary[permissionGroups[pg]];
  });
  return Object.keys(permissionGroupParentIds).map(async permissionGroupName => {
    const result = await updateValues(
      db,
      'permission_group',
      { parent_id: permissionGroupParentIds[permissionGroupName] },
      { name: permissionGroupName },
    );
    return result;
  });
};

exports.up = async function (db) {
  const parentNames = [...new Set(Object.values(newPermissionGroupParents))];
  const parentName2Id = await getPermissionGroupIds(db, parentNames);

  const result = await Promise.all(
    updatePermissionGroupParents(db, newPermissionGroupParents, parentName2Id),
  );
  return result;
};

exports.down = async function (db) {
  const parentNames = [...new Set(Object.values(oldPermissionGroupParents))];
  const parentName2Id = await getPermissionGroupIds(db, parentNames);

  const result = await Promise.all(
    updatePermissionGroupParents(db, oldPermissionGroupParents, parentName2Id),
  );
  return result;
};

exports._meta = {
  version: 1,
};
