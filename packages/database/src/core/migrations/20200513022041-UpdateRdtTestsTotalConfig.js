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

const NEW_CONFIG = {
  dataBuilders: {
    'mRDT Total': {
      dataBuilder: 'sumPerWeek',
      dataBuilderConfig: {
        dataClasses: {
          value: {
            codes: ['SSWT1072'],
          },
        },
      },
    },
    'mRDT Positive Percentage': {
      dataBuilder: 'composePercentagesPerPeriod',
      dataBuilderConfig: {
        percentages: {
          value: {
            numerator: 'positiveCount',
            denominator: 'consultationCount',
          },
        },
        dataBuilders: {
          positiveCount: {
            dataBuilder: 'sumPerWeek',
            dataBuilderConfig: {
              dataClasses: {
                value: {
                  codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
                },
              },
            },
          },
          consultationCount: {
            dataBuilder: 'sumPerWeek',
            dataBuilderConfig: {
              dataClasses: {
                value: {
                  codes: ['SSWT1072'],
                },
              },
            },
          },
        },
      },
    },
  },
};
const OLD_CONFIG = {
  dataBuilders: {
    'mRDT Total': {
      dataBuilder: 'sumPerWeek',
      dataBuilderConfig: {
        dataSource: {
          type: 'single',
          codes: ['SSWT1072'],
        },
      },
    },
    'mRDT Positive Percentage': {
      dataBuilder: 'composePercentagesPerPeriod',
      dataBuilderConfig: {
        percentages: {
          value: {
            numerator: 'positiveCount',
            denominator: 'consultationCount',
          },
        },
        dataBuilders: {
          positiveCount: {
            dataBuilder: 'sumPerWeek',
            dataBuilderConfig: {
              dataSource: {
                type: 'single',
                codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
              },
            },
          },
          consultationCount: {
            dataBuilder: 'sumPerWeek',
            dataBuilderConfig: {
              dataSource: {
                type: 'single',
                codes: ['SSWT1072'],
              },
            },
          },
        },
      },
    },
  },
};

const REPORT_ID = 'PG_Strive_PNG_RDT_Tests_Total_And_Percent_Positive';

const updateConfig = (db, config) =>
  db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(config)}'
    WHERE id = '${REPORT_ID}';
`);

exports.up = function (db) {
  return updateConfig(db, NEW_CONFIG);
};

exports.down = function (db) {
  return updateConfig(db, OLD_CONFIG);
};

exports._meta = {
  version: 1,
};
