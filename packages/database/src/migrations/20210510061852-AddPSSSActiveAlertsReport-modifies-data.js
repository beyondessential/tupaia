'use strict';

import { generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT_CODE = 'PSSS_Active_Alerts';

exports.up = async function (db) {
  const report = {
    id: generateId(),
    code: REPORT_CODE,
    config: {
      fetch: {
        dataGroups: ['PSSS_Alert'],
        dataElements: ['PSSS_Alert_Syndrome', 'PSSS_Alert_Archived', 'PSSS_Outbreak_Date'],
      },
      transform: [
        {
          // filter active alerts
          transform: 'filter',
          where:
            "(eq($row['PSSS_Alert_Archived'], 0) or notExists($row['PSSS_Alert_Archived'])) and notExists($row['PSSS_Outbreak_Date'])",
        },
        'convertEventDateToWeek',
        {
          // change key names
          transform: 'select',
          "'syndrome'": '$row.PSSS_Alert_Syndrome',
          "'id'": '$row.event',
          "'organisationUnit'": '$row.orgUnit',
          '...': ['period'],
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'PSSS'),
  };
  return insertObject(db, 'report', report);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM report
    WHERE code = '${REPORT_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
