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
  code: 'PG_Strive_Mosquito_Species_MapOverlay',
  config: {
    fetch: {
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
      dataElements: ['STRVEC_AE-AT13'],
    },
    transform: [
      {
        transform: 'select',
        "'numerator'": '1',
        "'organisationUnitCode'": '$row.organisationUnit',
        "'name'": '$row.value',
      },
      {
        transform: 'select',
        "'denominator'":
          'sum($where(f($otherRow) = equalText($otherRow.organisationUnitCode, $row.organisationUnitCode)).numerator)',
        '...': ['numerator', 'organisationUnitCode', 'name'],
      },
      {
        transform: 'aggregate',
        numerator: 'sum',
        organisationUnitCode: 'group',
        name: 'group',
        denominator: 'first',
      },
      {
        transform: 'select',
        '$row.name': 'formatAsFractionAndPercentage($row.numerator, $row.denominator)',
        "'value'": "'exists'", // Just a tag to indicator we have data
        '...': ['organisationUnitCode'],
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
   DELETE FROM "report" WHERE code = '${REPORT.code}';
  `);
};

exports._meta = {
  version: 1,
};
