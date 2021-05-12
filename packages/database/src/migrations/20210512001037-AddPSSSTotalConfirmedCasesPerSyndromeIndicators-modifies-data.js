'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const SYNDROMES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

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
  for (const syndrome of SYNDROMES) {
    const indicator = {
      id: generateId(),
      code: `PSSS_Total_${syndrome}_Confirmed_Cases`,
      builder: 'analyticArithmetic',
      config: {
        formula: `PSSS_Confirmed_${syndrome}_Cases`,
        aggregation: ['FINAL_EACH_WEEK', 'SUM_PER_ORG_GROUP'],
      },
    };

    await insertObject(db, 'indicator', indicator);
  }

  return null;
};

exports.down = async function (db) {
  const indicatorCodes = SYNDROMES.map(syndrome => `PSSS_Total_${syndrome}_Confirmed_Cases`);

  await db.runSql(`
    DELETE FROM indicator
    WHERE code IN (${arrayToDbString(indicatorCodes)});
  `);
};

exports._meta = {
  version: 1,
};
