'use strict';

import { insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT_CODE = 'PSSS_Confirmed_Weekly_Report';

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
          'PSSS_Confirmed_Sites_Reported',
          'PSSS_Confirmed_Sites',
          'PSSS_Confirmed_AFR_Cases',
          'PSSS_Confirmed_AFR_Alert_Threshold_Crossed',
          'PSSS_Confirmed_DIA_Cases',
          'PSSS_Confirmed_DIA_Alert_Threshold_Crossed',
          'PSSS_Confirmed_ILI_Cases',
          'PSSS_Confirmed_ILI_Alert_Threshold_Crossed',
          'PSSS_Confirmed_PF_Cases',
          'PSSS_Confirmed_PF_Alert_Threshold_Crossed',
          'PSSS_Confirmed_DLI_Cases',
          'PSSS_Confirmed_DLI_Alert_Threshold_Crossed',
        ],
      },
      transform: [
        'keyValueByDataElementName',
        'convertPeriodToWeek',
        'firstValuePerPeriodPerOrgUnit',
        {
          transform: 'select',
          "'AFR'": '$row.PSSS_Confirmed_AFR_Cases',
          "'AFR Threshold Crossed'": '$row.PSSS_Confirmed_AFR_Alert_Threshold_Crossed == 1',
          "'DIA'": '$row.PSSS_Confirmed_DIA_Cases',
          "'DIA Threshold Crossed'": '$row.PSSS_Confirmed_DIA_Alert_Threshold_Crossed == 1',
          "'ILI'": '$row.PSSS_Confirmed_ILI_Cases',
          "'ILI Threshold Crossed'": '$row.PSSS_Confirmed_ILI_Alert_Threshold_Crossed == 1',
          "'PF'": '$row.PSSS_Confirmed_PF_Cases',
          "'PF Threshold Crossed'": '$row.PSSS_Confirmed_PF_Alert_Threshold_Crossed == 1',
          "'DLI'": '$row.PSSS_Confirmed_DLI_Cases',
          "'DLI Threshold Crossed'": '$row.PSSS_Confirmed_DLI_Alert_Threshold_Crossed == 1',
          "'Sites'": '$row.PSSS_Confirmed_Sites',
          "'Sites Reported'": '$row.PSSS_Confirmed_Sites_Reported',
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
