'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const CONDITION_CODES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

// eg 'PSSS_Confirmed_AFR_Site_Average'
const psssCode = (descriptor, condition = '', isConfirmed = false) => {
  const parts = ['PSSS', descriptor];
  if (condition) {
    parts.splice(1, 0, condition);
  }
  if (isConfirmed) {
    parts.splice(1, 0, 'Confirmed');
  }

  return parts.join('_');
};

const insertIndicator = async (db, indicator) => {
  await insertObject(db, 'indicator', { ...indicator, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: indicator.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

const createTotalSitesReportedIndicator = db =>
  insertIndicator(db, {
    code: psssCode('Total_Sites_Reported'),
    builder: 'arithmetic',
    config: {
      // Just use a single data element for now, this logic will be extended in the future
      formula: psssCode('Sites_Reported'),
      aggregation: 'FINAL_EACH_WEEK',
    },
  });

const createTotalCasesIndicator = async (db, condition) =>
  insertIndicator(db, {
    code: psssCode('Total_Cases', condition),
    builder: 'arithmetic',
    config: {
      // Just use a single data element for now, this logic will be extended in the future
      formula: psssCode('Cases', condition),
      aggregation: 'FINAL_EACH_WEEK',
    },
  });

const createSiteAverageIndicator = async (db, condition, isConfirmed) => {
  const cases = psssCode(isConfirmed ? 'Cases' : 'Total_Cases', condition, isConfirmed);
  const sitesReported = psssCode(isConfirmed ? 'Sites_Reported' : 'Total_Sites_Reported');

  return insertIndicator(db, {
    code: psssCode('Site_Average', condition, isConfirmed),
    builder: 'arithmetic',
    config: {
      formula: `${cases} / ${sitesReported}`,
      aggregation: 'FINAL_EACH_WEEK',
    },
  });
};

const createWowIncreaseIndicator = async (db, condition, isConfirmed) => {
  const currentAverage = psssCode('Site_Average', condition, isConfirmed);
  const prevAverage = 'siteAveragePrevWeek';

  return insertIndicator(db, {
    code: psssCode('WoW_Increase', condition, isConfirmed),
    builder: 'arithmetic',
    config: {
      formula: `${currentAverage} / ${prevAverage}`,
      aggregation: 'FINAL_EACH_WEEK',
      parameters: [
        {
          code: prevAverage,
          builder: 'arithmetic',
          config: {
            formula: currentAverage,
            aggregation: [
              'FINAL_EACH_WEEK',
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        },
      ],
    },
  });
};

exports.up = async function (db) {
  await createTotalSitesReportedIndicator(db);
  await Promise.all(
    CONDITION_CODES.map(async condition => {
      await createTotalCasesIndicator(db, condition);

      await createSiteAverageIndicator(db, condition, true);
      await createSiteAverageIndicator(db, condition, false);

      await createWowIncreaseIndicator(db, condition, true);
      await createWowIncreaseIndicator(db, condition, false);
    }),
  );
};

exports.down = async function (db) {
  const codes = CONDITION_CODES.flatMap(condition => [
    psssCode('Total_Cases', condition),
    psssCode('Site_Average', condition, true),
    psssCode('Site_Average', condition, false),
    psssCode('WoW_Increase', condition, true),
    psssCode('WoW_Increase', condition, false),
  ])
    .concat(psssCode('Total_Sites_Reported'));

  await db.runSql(`DELETE FROM indicator WHERE code IN (${arrayToDbString(codes)})`);
  await db.runSql(`DELETE FROM data_source WHERE code IN (${arrayToDbString(codes)})`);
};

exports._meta = {
  version: 1,
};
