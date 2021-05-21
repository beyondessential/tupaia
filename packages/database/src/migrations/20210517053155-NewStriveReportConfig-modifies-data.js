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
  code: 'STRIVE_Average_Mortality_AE_IR',
  config: {
    fetch: {
      dataGroups: ['SI'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
      dataElements: ['STRVEC_AE-IR09', 'STRVEC_AE-IR02'],
    },
    transform: [
      {
        where: "exists($row['STRVEC_AE-IR09'],$row['STRVEC-AE_IR02'])",
        transform: 'filter',
      },
      {
        '...': ['orgUnit', 'STRVEC_AE-IR02', 'STRVEC_AE-IR09'],
        transform: 'select',
      },
      {
        orgUnit: 'group',
        transform: 'aggregate',
        'STRVEC_AE-IR02': 'group',
        'STRVEC_AE-IR09': 'avg',
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
