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

const TOTAL_SITES_REPORTED_INDICATOR = {
  code: 'PSSS_Total_Sites_Reported',
  oldConfig: {
    formula:
      'firstExistingValue(PSSS_Sites_Reported, countrySiteWeeklyResponsesCount, countrySiteDailyResponsesCount, singleSiteWeeklyResponseCount, singleSiteDailyResponseCount)',
    parameters: [
      {
        code: 'countrySiteWeeklyResponsesCount',
        config: {
          formula: 'PSSS_Site_Weekly_Survey_Completed',
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
        code: 'countrySiteDailyResponsesCount',
        config: {
          formula: 'PSSS_Site_Daily_Survey_Completed',
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
        code: 'singleSiteWeeklyResponseCount',
        config: {
          formula: 'PSSS_Site_Weekly_Survey_Completed',
          aggregation: ['FINAL_EACH_WEEK'],
        },
        builder: 'analyticArithmetic',
      },
      {
        code: 'singleSiteDailyResponseCount',
        config: {
          formula: 'PSSS_Site_Daily_Survey_Completed',
          aggregation: ['FINAL_EACH_WEEK'],
        },
        builder: 'analyticArithmetic',
      },
    ],
    aggregation: {
      PSSS_Sites_Reported: 'FINAL_EACH_WEEK',
      singleSiteDailyResponseCount: 'RAW',
      singleSiteWeeklyResponseCount: 'RAW',
      countrySiteDailyResponsesCount: 'RAW',
      countrySiteWeeklyResponsesCount: 'RAW',
    },
    defaultValues: {
      PSSS_Sites_Reported: 'undefined',
      singleSiteDailyResponseCount: 'undefined',
      singleSiteWeeklyResponseCount: 'undefined',
      countrySiteDailyResponsesCount: 'undefined',
      countrySiteWeeklyResponsesCount: 'undefined',
    },
  },
  newConfig: {
    formula:
      'firstExistingValue(PSSS_Sites_Reported, siteWeeklyResponsesCount, siteDailyResponsesCount)',
    parameters: [
      {
        code: 'siteWeeklyResponsesCount',
        config: {
          formula: 'PSSS_Site_Weekly_Survey_Completed',
          aggregation: [
            'FINAL_EACH_WEEK',
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'facility',
                aggregationEntityType: 'requested',
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
      {
        code: 'siteDailyResponsesCount',
        config: {
          formula: 'PSSS_Site_Daily_Survey_Completed',
          aggregation: [
            'FINAL_EACH_WEEK',
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'facility',
                aggregationEntityType: 'requested',
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
    ],
    aggregation: {
      PSSS_Sites_Reported: 'FINAL_EACH_WEEK',
      siteDailyResponsesCount: 'RAW',
      siteWeeklyResponsesCount: 'RAW',
    },
    defaultValues: {
      PSSS_Sites_Reported: 'undefined',
      siteDailyResponsesCount: 'undefined',
      siteWeeklyResponsesCount: 'undefined',
    },
  },
};

const SYNDROMES = ['AFR', 'PF', 'DLI', 'DIA', 'ILI'];

const syndromeToIndicator = syndrome => ({
  code: `PSSS_${syndrome}_Total_Cases`,
  oldConfig: {
    formula: `firstExistingValue(PSSS_${syndrome}_Cases, PSSS_${syndrome}_Daily_Cases, sumSiteWeeklyCases, sumSiteDailyCases)`,
    parameters: [
      {
        code: 'sumSiteWeeklyCases',
        config: {
          formula: `PSSS_${syndrome}_Cases`,
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
          formula: `PSSS_${syndrome}_Daily_Cases`,
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
    ],
    aggregation: {
      [`PSSS_${syndrome}_Cases`]: 'FINAL_EACH_WEEK',
      sumSiteDailyCases: 'RAW',
      sumSiteWeeklyCases: 'RAW',
      [`PSSS_${syndrome}_Daily_Cases`]: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
    },
    defaultValues: {
      [`PSSS_${syndrome}_Cases`]: 'undefined',
      sumSiteDailyCases: 'undefined',
      sumSiteWeeklyCases: 'undefined',
      [`PSSS_${syndrome}_Daily_Cases`]: 'undefined',
    },
  },
  newConfig: {
    formula: `firstExistingValue(PSSS_${syndrome}_Cases, sumSiteWeeklyCases, sumSiteDailyCases)`,
    parameters: [
      {
        code: 'sumSiteWeeklyCases',
        config: {
          formula: `PSSS_${syndrome}_Cases`,
          aggregation: [
            'FINAL_EACH_WEEK',
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'facility',
                aggregationEntityType: 'requested',
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
      {
        code: 'sumSiteDailyCases',
        config: {
          formula: `PSSS_${syndrome}_Daily_Cases`,
          aggregation: [
            'SUM_EACH_WEEK',
            'FINAL_EACH_WEEK',
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'facility',
                aggregationEntityType: 'requested',
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
    ],
    aggregation: {
      [`PSSS_${syndrome}_Cases`]: 'FINAL_EACH_WEEK',
      sumSiteDailyCases: 'RAW',
      sumSiteWeeklyCases: 'RAW',
    },
    defaultValues: {
      [`PSSS_${syndrome}_Cases`]: 'undefined',
      sumSiteDailyCases: 'undefined',
      sumSiteWeeklyCases: 'undefined',
    },
  },
});

const SYNDROME_INDICATORS = SYNDROMES.map(syndromeToIndicator);
const INDICATORS = [...SYNDROME_INDICATORS, TOTAL_SITES_REPORTED_INDICATOR];

exports.up = async function (db) {
  await Promise.all(
    INDICATORS.map(async ({ code, newConfig }) =>
      db.runSql(`
      UPDATE indicator
      SET config = '${JSON.stringify(newConfig)}'
      WHERE code = '${code}';
    `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    INDICATORS.map(async ({ code, oldConfig }) =>
      db.runSql(`
      UPDATE indicator
      SET config = '${JSON.stringify(oldConfig)}'
      WHERE code = '${code}';
    `),
    ),
  );
};

exports._meta = {
  version: 1,
};
