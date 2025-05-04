'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const DATA_BUILDER_CONFIG = {
  series: {
    Male: {
      '70+': 'MALE_GT_70',
      '<1 years': 'MALE_LT_1',
      '1-9 years': 'MALE_1_TO_9',
      '10-19 years': 'MALE_10_TO_19',
      '20-29 years': 'MALE_20_TO_29',
      '30-39 years': 'MALE_30_TO_39',
      '40-49 years': 'MALE_40_TO_49',
      '50-59 years': 'MALE_50_TO_59',
      '60-69 years': 'MALE_60_TO_69',
    },
    Female: {
      '70+': 'FEMALE_GT_70',
      '<1 years': 'FEMALE_LT_1',
      '1-9 years': 'FEMALE_1_TO_9',
      '10-19 years': 'FEMALE_10_TO_19',
      '20-29 years': 'FEMALE_20_TO_29',
      '30-39 years': 'FEMALE_30_TO_39',
      '40-49 years': 'FEMALE_40_TO_49',
      '50-59 years': 'FEMALE_50_TO_59',
      '60-69 years': 'FEMALE_60_TO_69',
    },
  },
  groupBy: {
    type: 'dataValues',
    options: {
      MALE_GT_70: {
        dataValues: {
          QMIA008: {
            value: '70',
            operator: '>=',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_LT_1: {
        dataValues: {
          QMIA008: {
            value: '1',
            operator: '<',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      FEMALE_GT_70: {
        dataValues: {
          QMIA008: {
            value: '70',
            operator: '>=',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_LT_1: {
        dataValues: {
          QMIA008: {
            value: '1',
            operator: '<',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      MALE_1_TO_9: {
        dataValues: {
          QMIA008: {
            value: ['1', '9'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_10_TO_19: {
        dataValues: {
          QMIA008: {
            value: ['10', '19'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_20_TO_29: {
        dataValues: {
          QMIA008: {
            value: ['20', '29'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_30_TO_39: {
        dataValues: {
          QMIA008: {
            value: ['30', '39'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_40_TO_49: {
        dataValues: {
          QMIA008: {
            value: ['40', '49'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_50_TO_59: {
        dataValues: {
          QMIA008: {
            value: ['50', '59'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      MALE_60_TO_69: {
        dataValues: {
          QMIA008: {
            value: ['60', '69'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Male',
            operator: '=',
          },
        },
      },
      FEMALE_1_TO_9: {
        dataValues: {
          QMIA008: {
            value: ['1', '9'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_10_TO_19: {
        dataValues: {
          QMIA008: {
            value: ['10', '19'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_20_TO_29: {
        dataValues: {
          QMIA008: {
            value: ['20', '29'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_30_TO_39: {
        dataValues: {
          QMIA008: {
            value: ['30', '39'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_40_TO_49: {
        dataValues: {
          QMIA008: {
            value: ['40', '49'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_50_TO_59: {
        dataValues: {
          QMIA008: {
            value: ['50', '59'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
      FEMALE_60_TO_69: {
        dataValues: {
          QMIA008: {
            value: ['60', '69'],
            operator: 'range',
          },
          QMIA009: {
            value: 'Female',
            operator: '=',
          },
        },
      },
    },
  },
  programCode: 'SC1QMIA',
  entityAggregation: { dataSourceEntityType: 'individual' },
};

const VIEW_JSON_CONFIG = {
  name: 'Total Passengers by Age and Gender',
  type: 'chart',
  chartType: 'bar',
  chartConfig: {
    Male: { stackId: 1 },
    Female: { stackId: 2 },
  },
};

const DASHBOARD_GROUPS = ['WS_Covid_Samoa_Country_COVID-19'];

const REPORT_ID = 'Samoa_Covid_Total_Passengers_By_Age_and_Gender';

const DATA_SERVICES = [{ isDataRegional: true }];

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'countEvents',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON_CONFIG,
  dataServices: DATA_SERVICES,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports._meta = {
  version: 1,
};
