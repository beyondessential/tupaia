'use strict';

import { insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT_CODE = 'PSSS_Weekly_Report';

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
          'PSSS_AFR_Alert_Threshold_Crossed',
          'PSSS_AFR_WoW_Increase',
          'PSSS_DIA_Total_Cases',
          'PSSS_DIA_Alert_Threshold_Crossed',
          'PSSS_DIA_WoW_Increase',
          'PSSS_ILI_Total_Cases',
          'PSSS_ILI_Alert_Threshold_Crossed',
          'PSSS_ILI_WoW_Increase',
          'PSSS_PF_Total_Cases',
          'PSSS_PF_Alert_Threshold_Crossed',
          'PSSS_PF_WoW_Increase',
          'PSSS_DLI_Total_Cases',
          'PSSS_DLI_Alert_Threshold_Crossed',
          'PSSS_DLI_WoW_Increase',
        ],
      },
      transform: [
        'keyValueByDataElementName',
        'convertPeriodToWeek',
        'firstValuePerPeriodPerOrgUnit',
        {
          transform: 'select',
          "'AFR'": '$row.PSSS_AFR_Total_Cases',
          "'AFR Threshold Crossed'": '$row.PSSS_AFR_Alert_Threshold_Crossed == 1',
          "'AFR WoW Increase'": '$row.PSSS_AFR_WoW_Increase',
          "'DIA'": '$row.PSSS_DIA_Total_Cases',
          "'DIA Threshold Crossed'": '$row.PSSS_DIA_Alert_Threshold_Crossed == 1',
          "'DIA WoW Increase'": '$row.PSSS_DIA_WoW_Increase',
          "'ILI'": '$row.PSSS_ILI_Total_Cases',
          "'ILI Threshold Crossed'": '$row.PSSS_ILI_Alert_Threshold_Crossed == 1',
          "'ILI WoW Increase'": '$row.PSSS_ILI_WoW_Increase',
          "'PF'": '$row.PSSS_PF_Total_Cases',
          "'PF Threshold Crossed'": '$row.PSSS_PF_Alert_Threshold_Crossed == 1',
          "'PF WoW Increase'": '$row.PSSS_PF_WoW_Increase',
          "'DLI'": '$row.PSSS_DLI_Total_Cases',
          "'DLI Threshold Crossed'": '$row.PSSS_DLI_Alert_Threshold_Crossed == 1',
          "'DLI WoW Increase'": '$row.PSSS_DLI_WoW_Increase',
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
