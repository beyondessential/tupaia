'use strict';

import { insertObject } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const REPORT = {
  id: 'TO_HPU_Total_Screened_For_NCD_Risk_Factors_By_Age_And_Gender',
  dataBuilder: 'countEvents',
  dataBuilderConfig: {
    series: {
      Males: {
        '60+ years': 'MALE_GT_60',
        '<10 years': 'MALE_LT_10',
        '10-19 years': 'MALE_10_TO_19',
        '20-29 years': 'MALE_20_TO_29',
        '30-39 years': 'MALE_30_TO_39',
        '40-49 years': 'MALE_40_TO_49',
        '50-59 years': 'MALE_50_TO_59',
      },
      Females: {
        '60+ years': 'FEMALE_GT_60',
        '<10 years': 'FEMALE_LT_10',
        '10-19 years': 'FEMALE_10_TO_19',
        '20-29 years': 'FEMALE_20_TO_29',
        '30-39 years': 'FEMALE_30_TO_39',
        '40-49 years': 'FEMALE_40_TO_49',
        '50-59 years': 'FEMALE_50_TO_59',
      },
    },
    groupBy: {
      type: 'dataValues',
      options: {
        MALE_GT_60: {
          dataValues: {
            HP35n: { value: '60', operator: '>=' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        MALE_LT_10: {
          dataValues: {
            HP35n: { value: '10', operator: '<' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        FEMALE_GT_60: {
          dataValues: {
            HP35n: { value: '60', operator: '>=' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        FEMALE_LT_10: {
          dataValues: {
            HP35n: { value: '10', operator: '<' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        MALE_10_TO_19: {
          dataValues: {
            HP35n: { value: ['10', '19'], operator: 'range' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        MALE_20_TO_29: {
          dataValues: {
            HP35n: { value: ['20', '29'], operator: 'range' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        MALE_30_TO_39: {
          dataValues: {
            HP35n: { value: ['30', '39'], operator: 'range' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        MALE_40_TO_49: {
          dataValues: {
            HP35n: { value: ['40', '49'], operator: 'range' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        MALE_50_TO_59: {
          dataValues: {
            HP35n: { value: ['50', '59'], operator: 'range' },
            HP36n: { value: 'Male', operator: '=' },
          },
        },
        FEMALE_10_TO_19: {
          dataValues: {
            HP35n: { value: ['10', '19'], operator: 'range' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        FEMALE_20_TO_29: {
          dataValues: {
            HP35n: { value: ['20', '29'], operator: 'range' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        FEMALE_30_TO_39: {
          dataValues: {
            HP35n: { value: ['30', '39'], operator: 'range' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        FEMALE_40_TO_49: {
          dataValues: {
            HP35n: { value: ['40', '49'], operator: 'range' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
        FEMALE_50_TO_59: {
          dataValues: {
            HP35n: { value: ['50', '59'], operator: 'range' },
            HP36n: { value: 'Female', operator: '=' },
          },
        },
      },
    },
    programCode: 'HP02',
  },
  viewJson: {
    name: 'Total screened for NCD risk factors by age and gender',
    type: 'chart',
    chartType: 'bar',
    chartConfig: { Males: { stackId: 1 }, Females: { stackId: 2 } },
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
     WHERE
       "code" = '${DASHBOARD_GROUP_CODE}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
     WHERE
       "code" = '${DASHBOARD_GROUP_CODE}';
   `);
};

exports._meta = {
  version: 1,
};
