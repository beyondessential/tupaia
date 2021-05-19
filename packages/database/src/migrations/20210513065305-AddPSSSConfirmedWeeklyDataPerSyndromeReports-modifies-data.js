'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

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

const SYNDROMES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

const getReportCode = syndrome => `PSSS_${syndrome}_Confirmed_Weekly_Report`;

const getSyndromeWoWIncreaseIndicatorCode = syndrome => `PSSS_Confirmed_${syndrome}_WoW_Increase`;

const getSyndromeConfirmedCases = syndrome => `PSSS_Confirmed_${syndrome}_Cases`;

const getReport = (syndrome, permissionGroupId) => {
  const reportCode = getReportCode(syndrome);
  const syndromeWowIncreaseIndicatorCode = getSyndromeWoWIncreaseIndicatorCode(syndrome);
  const syndromeConfirmedCases = getSyndromeConfirmedCases(syndrome);

  return {
    id: generateId(),
    code: reportCode,
    config: {
      fetch: {
        dataElements: [syndromeWowIncreaseIndicatorCode, syndromeConfirmedCases],
        aggregations: ['FINAL_EACH_WEEK'],
      },
      transform: [
        'keyValueByDataElementName',
        'convertPeriodToWeek',
        'lastValuePerPeriodPerOrgUnit',
        {
          // change key names
          transform: 'select',
          "'percentageChange'": `$row.${syndromeWowIncreaseIndicatorCode}`,
          "'weeklyCases'": `$row.${syndromeConfirmedCases}`,
          '...': ['period', 'organisationUnit'],
        },
      ],
    },
    permission_group_id: permissionGroupId,
  };
};
exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'PSSS');
  for (const syndrome of SYNDROMES) {
    const report = getReport(syndrome, permissionGroupId);
    await insertObject(db, 'report', report);
  }
};

exports.down = async function (db) {
  const reportCodes = SYNDROMES.map(getReportCode);

  await db.runSql(`
    DELETE FROM report
    WHERE code IN (${arrayToDbString(reportCodes)});
  `);
};

exports._meta = {
  version: 1,
};
