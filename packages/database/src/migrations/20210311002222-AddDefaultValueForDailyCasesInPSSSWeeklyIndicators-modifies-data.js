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

const INDICATORS = [
  {
    code: 'PSSS_DIA_Total_Cases',
    oldConfig: {
      formula: 'firstExistingValue(PSSS_DIA_Cases, PSSS_DIA_Daily_Cases)',
      aggregation: {
        PSSS_DIA_Cases: 'FINAL_EACH_WEEK',
        PSSS_DIA_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_DIA_Cases: 'undefined',
      },
    },
    newConfig: {
      formula: 'firstExistingValue(PSSS_DIA_Cases, PSSS_DIA_Daily_Cases)',
      aggregation: {
        PSSS_DIA_Cases: 'FINAL_EACH_WEEK',
        PSSS_DIA_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_DIA_Cases: 'undefined',
        PSSS_DIA_Daily_Cases: 'undefined', // new
      },
    },
  },
  {
    code: 'PSSS_ILI_Total_Cases',
    oldConfig: {
      formula: 'firstExistingValue(PSSS_ILI_Cases, PSSS_ILI_Daily_Cases)',
      aggregation: {
        PSSS_ILI_Cases: 'FINAL_EACH_WEEK',
        PSSS_ILI_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_ILI_Cases: 'undefined',
      },
    },
    newConfig: {
      formula: 'firstExistingValue(PSSS_ILI_Cases, PSSS_ILI_Daily_Cases)',
      aggregation: {
        PSSS_ILI_Cases: 'FINAL_EACH_WEEK',
        PSSS_ILI_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_ILI_Cases: 'undefined',
        PSSS_ILI_Daily_Cases: 'undefined', // new
      },
    },
  },
  {
    code: 'PSSS_PF_Total_Cases',
    oldConfig: {
      formula: 'firstExistingValue(PSSS_PF_Cases, PSSS_PF_Daily_Cases)',
      aggregation: {
        PSSS_PF_Cases: 'FINAL_EACH_WEEK',
        PSSS_PF_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_PF_Cases: 'undefined',
      },
    },
    newConfig: {
      formula: 'firstExistingValue(PSSS_PF_Cases, PSSS_PF_Daily_Cases)',
      aggregation: {
        PSSS_PF_Cases: 'FINAL_EACH_WEEK',
        PSSS_PF_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_PF_Cases: 'undefined',
        PSSS_PF_Daily_Cases: 'undefined', // new
      },
    },
  },
  {
    code: 'PSSS_DLI_Total_Cases',
    oldConfig: {
      formula: 'firstExistingValue(PSSS_DLI_Cases, PSSS_DLI_Daily_Cases)',
      aggregation: {
        PSSS_DLI_Cases: 'FINAL_EACH_WEEK',
        PSSS_DLI_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_DLI_Cases: 'undefined',
      },
    },
    newConfig: {
      formula: 'firstExistingValue(PSSS_DLI_Cases, PSSS_DLI_Daily_Cases)',
      aggregation: {
        PSSS_DLI_Cases: 'FINAL_EACH_WEEK',
        PSSS_DLI_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_DLI_Cases: 'undefined',
        PSSS_DLI_Daily_Cases: 'undefined', // new
      },
    },
  },
  {
    code: 'PSSS_AFR_Total_Cases',
    oldConfig: {
      formula: 'firstExistingValue(PSSS_AFR_Cases, PSSS_AFR_Daily_Cases)',
      aggregation: {
        PSSS_AFR_Cases: 'FINAL_EACH_WEEK',
        PSSS_AFR_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_AFR_Cases: 'undefined',
      },
    },
    newConfig: {
      formula: 'firstExistingValue(PSSS_AFR_Cases, PSSS_AFR_Daily_Cases)',
      aggregation: {
        PSSS_AFR_Cases: 'FINAL_EACH_WEEK',
        PSSS_AFR_Daily_Cases: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
      },
      defaultValues: {
        PSSS_AFR_Cases: 'undefined',
        PSSS_AFR_Daily_Cases: 'undefined', // new
      },
    },
  },
];

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
      const { code, newConfig } = indicator;
      return updateIndicator(db, code, newConfig);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    INDICATORS.map(indicator => {
      const { code, oldConfig } = indicator;
      return updateIndicator(db, code, oldConfig);
    }),
  );
};

exports._meta = {
  version: 1,
};
