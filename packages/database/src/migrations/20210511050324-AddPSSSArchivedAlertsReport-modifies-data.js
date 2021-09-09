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

const REPORT_CODE = 'PSSS_Archived_Alerts';

exports.up = async function (db) {
  const report = {
    id: generateId(),
    code: REPORT_CODE,
    config: {
      fetch: {
        dataGroups: ['PSSS_Alert'],
        dataElements: [
          'PSSS_Alert_Syndrome',
          'PSSS_Outbreak_Date',
          'PSSS_Outbreak_Diagnosis',
          'PSSS_Alert_Archived',
        ],
      },
      transform: [
        {
          // filter archived alerts
          transform: 'filter',
          where: "eq($row['PSSS_Alert_Archived'], 1)",
        },
        'convertEventDateToWeek',
        {
          // convert outbreakStartDate to correct DAY format
          transform: 'select',
          "'outbreakStartDate'": "dateStringToPeriod($row.PSSS_Outbreak_Date, 'DAY')",
          '...': '*',
        },
        {
          // change key names
          transform: 'select',
          "'syndrome'": '$row.PSSS_Alert_Syndrome',
          "'diagnosis'": '$row.PSSS_Outbreak_Diagnosis',
          "'id'": '$row.event',
          "'organisationUnit'": '$row.orgUnit',
          '...': ['outbreakStartDate', 'period'],
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
