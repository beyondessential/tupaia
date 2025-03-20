'use strict';

import { insertObject, generateId, arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = [
  'TO_Health_Promotion_Unit_Country',
  'TO_Health_Promotion_Unit_District',
];

const WAIST_CIRCUMFERENCE_INDICATOR = {
  id: generateId(),
  code: 'TO_Waist_Circumference_At_Risk_In_Screened_Population',
  builder: 'eventCheckConditions',
  config: {
    formula:
      "(equalText(HP36n, 'Male') and HP45n >= 100) or (equalText(HP36n, 'Female') and HP45n >= 90)",
    programCode: 'HP02',
  },
};

const BMI_INDICATOR = {
  id: generateId(),
  code: 'TO_BMI_At_Risk_In_Screened_Population',
  builder: 'eventCheckConditions',
  config: {
    formula: 'HP35n >= 19 and (HP75n >= 25 or (HP75n < 18 and HP75n > 0))',
    programCode: 'HP02',
  },
};

const DENOMINATOR = {
  dataValues: ['HP36n'], // mandatory Sex question. So the count of this data element will be = the number of survey responses
  valueOfInterest: '*',
};

const DASHBOARD_REPORT = {
  id: 'TO_Rate_At_Risk_In_Screened_Population',
  dataBuilder: 'percentagesOfAllValueCounts',
  dataBuilderConfig: {
    dataClasses: {
      'Waist Circumference (cm)': {
        numerator: {
          dataValues: [WAIST_CIRCUMFERENCE_INDICATOR.code],
          valueOfInterest: 1,
        },
        denominator: DENOMINATOR,
        sortOrder: 0,
      },
      'Body Fat (%)': {
        numerator: {
          dataValues: ['HP65n'],
          valueOfInterest: {
            operator: '>=',
            value: 30,
          },
        },
        denominator: DENOMINATOR,
        sortOrder: 1,
      },
      BMI: {
        numerator: {
          dataValues: [BMI_INDICATOR.code],
          valueOfInterest: 1,
        },
        denominator: DENOMINATOR,
        sortOrder: 2,
      },
      'Fasting Blood Sugar': {
        numerator: {
          dataValues: ['HP115n'],
          valueOfInterest: {
            operator: '>=',
            value: 6,
          },
        },
        denominator: DENOMINATOR,
        sortOrder: 3,
      },
      'Blood Pressure': {
        numerator: {
          dataValues: ['HP135n'],
          valueOfInterest: {
            operator: 'in',
            value: [
              'Elevated (131-139/81-89)',
              'Moderate High (140-159/90-99)',
              'Very High (≥160/≥100)',
            ],
          },
        },
        denominator: DENOMINATOR,
        sortOrder: 4,
      },
      Smokers: {
        numerator: {
          dataValues: ['HP155n'],
          valueOfInterest: 'Yes',
        },
        denominator: DENOMINATOR,
        sortOrder: 5,
      },
      'Alcohol Drinkers': {
        numerator: {
          dataValues: ['HP165n'],
          valueOfInterest: 'Yes',
        },
        denominator: DENOMINATOR,
        sortOrder: 6,
      },
      'Family History': {
        numerator: {
          dataValues: ['HP175n'],
          valueOfInterest: 'Yes',
        },
        denominator: DENOMINATOR,
        sortOrder: 7,
      },
      Referrals: {
        numerator: {
          dataValues: ['HP195n'],
          valueOfInterest: 'Yes',
        },
        denominator: DENOMINATOR,
        sortOrder: 8,
      },
    },
    programCode: 'HP02',
  },
  viewJson: {
    name: "Rate of 'at risk' NCD risk factors in screened population",
    type: 'chart',
    chartType: 'bar',
    labelType: 'fractionAndPercentage',
    valueType: 'percentage',
    periodGranularity: 'month',
    presentationOptions: {
      hideAverage: true,
    },
    chartConfig: {
      $all: {
        yAxisDomain: {
          max: {
            type: 'number',
            value: 1,
          },
          min: {
            type: 'number',
            value: 0,
          },
        },
      },
    },
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
};

exports.up = async function (db) {
  await insertObject(db, 'indicator', WAIST_CIRCUMFERENCE_INDICATOR);
  await insertObject(db, 'indicator', BMI_INDICATOR);

  await insertObject(db, 'data_source', {
    id: generateId(),
    code: WAIST_CIRCUMFERENCE_INDICATOR.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: BMI_INDICATOR.code,
    type: 'dataElement',
    service_type: 'indicator',
  });

  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${DASHBOARD_REPORT.id}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

async function deleteItemByOneCondition(db, table, condition) {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
    DELETE FROM
      "${table}"
    WHERE
      "${key}" = '${value}';
  `);
}

exports.down = async function (db) {
  await deleteItemByOneCondition(db, 'indicator', { code: WAIST_CIRCUMFERENCE_INDICATOR.code });
  await deleteItemByOneCondition(db, 'indicator', { code: BMI_INDICATOR.code });

  await deleteItemByOneCondition(db, 'data_source', { code: WAIST_CIRCUMFERENCE_INDICATOR.code });
  await deleteItemByOneCondition(db, 'data_source', { code: BMI_INDICATOR.code });

  await deleteItemByOneCondition(db, 'dashboardReport', { id: DASHBOARD_REPORT.id });
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = ARRAY_REMOVE("dashboardReports", '${DASHBOARD_REPORT.id}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
