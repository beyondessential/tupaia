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
  code: 'AU_Flutracking_Postcode_Percent_Report',
  config: {
    fetch: {
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'postcode',
          },
        },
      ],
      dataElements: ['FWV_PC_004', 'FWV_PC_003'],
      dataGroups: ['FPWV'],
    },
    transform: [
      {
        transform: 'select',
        "'numerator'": '$row.FWV_PC_004',
        "'denominator'": '$row.FWV_PC_003',
        "'organisationUnitCode'": '$row.orgUnit',
      },
      {
        transform: 'aggregate',
        numerator: 'sum',
        denominator: 'sum',
        organisationUnitCode: 'group',
      },
      {
        transform: 'select',
        "'value'": 'divide($row.numerator, $row.denominator)',
        "'Total respondents'": '$row.denominator',
        "'Respondents reporting fever & cough'": '$row.numerator',
        '...': ['organisationUnitCode'],
      },
    ],
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'Public');
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
