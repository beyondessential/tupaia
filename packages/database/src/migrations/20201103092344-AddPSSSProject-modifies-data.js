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

const PROJECT_CODE = 'psss';
const ENTITY_NAME = 'PSSS';
const DASHBOARDGROUP_NAME = 'PSSS';
const USER_GROUP = 'PSSS';

const COUNTRY_LIST = [
  'AS',
  'CK',
  'FM',
  'FJ',
  'PF',
  'GU',
  'KI',
  'MH',
  'NR',
  'NC',
  'NU',
  'MP',
  'PW',
  'PG',
  'PI',
  'WS',
  'SB',
  'TK',
  'TO',
  'TV',
  'VU',
  'WF',
];

export const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  // Add project entity and entity hierarchy for PSSS
  await insertObject(db, 'entity', {
    id: generateId(),
    code: PROJECT_CODE,
    parent_id: await codeToId(db, 'entity', 'World'),
    name: ENTITY_NAME,
    type: 'project',
  });
  await insertObject(db, 'entity_hierarchy', {
    id: generateId(),
    name: PROJECT_CODE,
  });

  // Add entity relations for the full list of countries underneath the PSSS project
  for (let i = 0; i < COUNTRY_LIST.length; ++i) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: await codeToId(db, 'entity', PROJECT_CODE),
      child_id: await codeToId(db, 'entity', COUNTRY_LIST[i]),
      entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
    });
  }

  // Add PSSS project
  await insertObject(db, 'project', {
    id: generateId(),
    code: PROJECT_CODE,
    description: 'Pacific Syndromic Surveillance System',
    sort_order: 8,
    dashboard_group_name: DASHBOARDGROUP_NAME,
    user_groups: `{${USER_GROUP}}`,
    entity_id: await codeToId(db, 'entity', PROJECT_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

exports.down = async function (db) {
  const hierarchyId = await hierarchyNameToId(db, PROJECT_CODE);

  await db.runSql(`DELETE FROM project WHERE code = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE name = '${PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${PROJECT_CODE}'`);
};

exports._meta = {
  version: 1,
};
