'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Facility';

const REPORT = {
  id: 'PG_Strive_PNG_RDT_Tests_Total_And_Percent_Positive',
  dataBuilder: 'composeDataPerPeriod',
  dataBuilderConfig: {
    dataBuilders: {
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
      'mRDT Total': {
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
  viewJson: {
    name: 'Weekly % of positive mRDT cases against total number of tests',
    type: 'chart',
    chartType: 'composed',
    chartConfig: {
      'mRDT Positive Percentage': {
        label: 'Percentage of positive mRDT cases',
        chartType: 'line',
        valueType: 'percentage',
        yAxisOrientation: 'right',
        color: '#FFD700',
      },
      'mRDT Total': {
        label: '# mRDT Tests',
        chartType: 'bar',
        color: '#2194F9',
      },
    },
    periodGranularity: 'week',
  },
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
