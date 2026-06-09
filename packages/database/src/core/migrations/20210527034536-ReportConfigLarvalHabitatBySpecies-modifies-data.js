'use strict';

import { generateId, insertObject } from '../utilities';

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

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT = {
  id: generateId(),
  code: 'PG_STRIVE_Habitat_By_Species',
  config: {
    fetch: {
      dataGroups: ['STRVEC_LHS'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
      dataElements: ['STRVEC_LHS13', 'STRVEC_LHS36'],
    },
    transform: [
      {
        transform: 'filter',
        where: "exists($row['STRVEC_LHS13'],$row['STRVEC_LHS36'])",
      },
      {
        transform: 'select',
        "'species'": '$row.STRVEC_LHS13',
        "'name'": '$row.STRVEC_LHS36',
      },
      {
        transform: 'select',
        '$row.species': '1',
        '...': ['name'],
      },
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'sum',
      },
    ],
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'STRIVE User');
  await insertObject(db, 'report', { ...REPORT, permission_group_id: permissionGroupId });
};

exports.down = async function (db) {
  return db.runSql(`
   DELETE FROM "report" WHERE id = '${REPORT.id}';
  `);
};

exports._meta = {
  version: 1,
};
