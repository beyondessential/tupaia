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

const NEW_INDICATOR_CONFIG = {
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
    countrySiteWeeklyResponsesCount: 'RAW',
    countrySiteDailyResponsesCount: 'RAW',
    singleSiteWeeklyResponseCount: 'RAW',
    singleSiteDailyResponseCount: 'RAW',
  },
  defaultValues: {
    PSSS_Sites_Reported: 'undefined',
    countrySiteWeeklyResponsesCount: 'undefined',
    countrySiteDailyResponsesCount: 'undefined',
    singleSiteWeeklyResponseCount: 'undefined',
    singleSiteDailyResponseCount: 'undefined',
  },
};

const OLD_INDICATOR_CONFIG = {
  formula:
    'firstExistingValue(PSSS_Sites_Reported, PSSS_Site_Weekly_Survey_Completed, PSSS_Site_Daily_Survey_Completed)',
  aggregation: {
    PSSS_Sites_Reported: 'FINAL_EACH_WEEK',
    PSSS_Site_Daily_Survey_Completed: [
      'FINAL_EACH_WEEK',
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'facility',
          aggregationEntityType: 'country',
        },
      },
    ],
    PSSS_Site_Weekly_Survey_Completed: [
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
  defaultValues: {
    PSSS_Sites_Reported: 'undefined',
    PSSS_Site_Daily_Survey_Completed: 'undefined',
    PSSS_Site_Weekly_Survey_Completed: 'undefined',
  },
};

const INDICATOR_CODE = 'PSSS_Total_Sites_Reported';

exports.up = async function (db) {
  await db.runSql(`
    UPDATE indicator
    SET config = '${JSON.stringify(NEW_INDICATOR_CONFIG)}'
    WHERE code = '${INDICATOR_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE indicator
    SET config = '${JSON.stringify(OLD_INDICATOR_CONFIG)}'
    WHERE code = '${INDICATOR_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
