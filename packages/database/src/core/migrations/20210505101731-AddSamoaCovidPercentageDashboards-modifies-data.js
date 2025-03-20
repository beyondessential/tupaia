'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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
  'WS_Covid_Samoa_Country_COVID-19',
  'WS_Covid_Samoa_District_COVID-19',
  'WS_Covid_Samoa_Village_COVID-19',
];

const getDataBuilderConfig = doseNum => ({
  series: {
    value: {
      // The value of this key (value) IS important
      xyz: {
        // The value of this key (xyz) is not important
        operands: [
          {
            dataValues: [doseNum === 1 ? 'COVIDVac4' : 'COVIDVac8'],
          },
          {
            aggregationType: 'SUM_LATEST_PER_ORG_UNIT',
            dataValues: ['population_WS001'],
          },
        ],
        operator: 'DIVIDE',
      },
    },
  },
  aggregations: [
    {
      type: 'FINAL_EACH_DAY',
    },
  ],
  entityAggregation: {
    aggregationOrder: 'BEFORE',
    dataSourceEntityType: 'village',
  },
});

const getViewJson = doseNum => ({
  name: `% of eligible population received ${doseNum === 1 ? '1st' : '2nd'} dose COVID vaccine`,
  type: 'view',
  viewType: 'singleValue',
  valueType: 'percentage',
});

const getReport = ({ id, doseNum }) => ({
  id,
  dataBuilder: 'calcPerSeries',
  dataBuilderConfig: getDataBuilderConfig(doseNum),
  viewJson: getViewJson(doseNum),
  dataServices: [{ isDataRegional: true }],
});

const REPORTS = [
  {
    id: 'WS_Covid_Samoa_COVID-19_Percent_Of_Population_1st_Vaccine_Dose_Taken',
    doseNum: 1,
  },
  {
    id: 'WS_Covid_Samoa_COVID-19_Percent_Of_Population_2nd_Vaccine_Dose_Taken',
    doseNum: 2,
  },
];

exports.up = async function (db) {
  Promise.all(
    REPORTS.map(reportConfig => insertObject(db, 'dashboardReport', getReport(reportConfig))),
  );

  return db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" || array[${arrayToDbString(
      REPORTS.map(dash => dash.id),
    )}]
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id IN (${arrayToDbString(REPORTS.map(dash => dash.id))});
  `);

  await Promise.all(
    REPORTS.map(({ id }) => {
      return db.runSql(`    
        UPDATE "dashboardGroup"
        SET "dashboardReports" = array_remove("dashboardReports", '${id}')
        WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
