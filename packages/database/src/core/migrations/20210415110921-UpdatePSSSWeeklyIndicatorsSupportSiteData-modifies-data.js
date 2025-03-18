'use strict';

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

const oldConfig = syndromeCode => ({
  formula: `firstExistingValue(PSSS_${syndromeCode}_Cases, PSSS_${syndromeCode}_Daily_Cases)`,
  aggregation: {
    [`PSSS_${syndromeCode}_Cases`]: 'FINAL_EACH_WEEK',
    [`PSSS_${syndromeCode}_Daily_Cases`]: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
  },
  defaultValues: {
    [`PSSS_${syndromeCode}_Cases`]: 'undefined',
    [`PSSS_${syndromeCode}_Daily_Cases`]: 'undefined',
  },
});

const siteParameters = syndromeCode => [
  {
    code: 'sumSiteWeeklyCases',
    config: {
      formula: `PSSS_${syndromeCode}_Cases`,
      aggregation: [
        'FINAL_EACH_WEEK',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'facility',
            aggregationEntityType: 'country',
          },
        },
      ],
    },
    builder: 'analyticArithmetic',
  },
  {
    code: 'sumSiteDailyCases',
    config: {
      formula: `PSSS_${syndromeCode}_Daily_Cases`,
      aggregation: [
        'SUM_EACH_WEEK',
        'FINAL_EACH_WEEK',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'facility',
            aggregationEntityType: 'country',
          },
        },
      ],
    },
    builder: 'analyticArithmetic',
  },
];

const newConfig = syndromeCode => ({
  formula: `firstExistingValue(PSSS_${syndromeCode}_Cases, PSSS_${syndromeCode}_Daily_Cases, sumSiteWeeklyCases, sumSiteDailyCases)`,
  parameters: siteParameters(syndromeCode),
  aggregation: {
    [`PSSS_${syndromeCode}_Cases`]: 'FINAL_EACH_WEEK',
    [`PSSS_${syndromeCode}_Daily_Cases`]: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
    sumSiteWeeklyCases: 'RAW',
    sumSiteDailyCases: 'RAW',
  },
  defaultValues: {
    [`PSSS_${syndromeCode}_Cases`]: 'undefined',
    [`PSSS_${syndromeCode}_Daily_Cases`]: 'undefined',
    sumSiteWeeklyCases: 'undefined',
    sumSiteDailyCases: 'undefined',
  },
});

const SYNDROME_CODES = ['AFR', 'DIA', 'DLI', 'ILI', 'PF'];
const INDICATORS = SYNDROME_CODES.map(syndromeCode => ({
  code: `PSSS_${syndromeCode}_Total_Cases`,
  oldConfig: oldConfig(syndromeCode),
  newConfig: newConfig(syndromeCode),
}));

const updateIndicator = async (db, code, config) => {
  return db.runSql(`
    UPDATE
      "indicator"
    SET
      "config" = '${JSON.stringify(config)}'
    WHERE
    "code" = '${code}';
  `);
};

exports.up = async function (db) {
  await Promise.all(
    INDICATORS.map(indicator => {
      const { code, newConfig: newConf } = indicator;
      return updateIndicator(db, code, newConf);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    INDICATORS.map(indicator => {
      const { code, oldConfig: oldConf } = indicator;
      return updateIndicator(db, code, oldConf);
    }),
  );
};

exports._meta = {
  version: 1,
};
