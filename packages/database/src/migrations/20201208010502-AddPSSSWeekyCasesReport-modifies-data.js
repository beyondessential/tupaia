'use strict';

import { insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT_CODE = 'PSSS_Weekly_Cases';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  return insertObject(db, 'report', {
    id: generateId(),
    code: REPORT_CODE,
    config: {
      fetch: {
        dataElements: [
          'PSSS_Total_Sites_Reported',
          'PSSS_Total_Sites',
          'PSSS_AFR_Total_Cases',
          'PSSS_DIA_Total_Cases',
          'PSSS_ILI_Total_Cases',
          'PSSS_PF_Total_Cases',
          'PSSS_DLI_Total_Cases',
        ],
      },
      transform: [
        'keyValueByDataElementName',
        'convertPeriodToWeek',
        'firstValuePerPeriodPerOrgUnit',
        {
          transform: 'select',
          "'AFR'": '$row.PSSS_AFR_Total_Cases',
          "'DIA'": '$row.PSSS_DIA_Total_Cases',
          "'ILI'": '$row.PSSS_ILI_Total_Cases',
          "'PF'": '$row.PSSS_PF_Total_Cases',
          "'DLI'": '$row.PSSS_DLI_Total_Cases',
          "'Sites'": '$row.PSSS_Total_Sites',
          "'Sites Reported'": '$row.PSSS_Total_Sites_Reported',
          '...': ['period', 'organisationUnit'],
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'PSSS'),
  });
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
