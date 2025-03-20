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

const DASHBOARD_GROUP_CODES = ['AU_Covid_District', 'AU_Covid_Country'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const REPORT = {
  id: 'COVID_Compose_Daily_Deaths_Vs_Cases',
  dataBuilder: 'composeDataPerPeriod',
  dataBuilderConfig: {
    dataBuilders: {
      deaths: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey004'],
          },
        },
      },
      cases: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey003'],
          },
        },
      },
    },
  },
  viewJson: {
    name: 'Confirmed cases vs deaths (Daily)',
    type: 'chart',
    chartType: 'composed',
    chartConfig: {
      cases: {
        label: 'Confirmed Cases',
        chartType: 'line',
        yAxisOrientation: 'right',
        color: '#FFD700',
      },
      deaths: {
        label: 'Deaths',
        chartType: 'bar',
        color: '#2194F9',
        yAxisDomain: {
          min: {
            type: 'number',
            value: 0,
          },
          max: {
            type: 'scale',
            value: 2,
          },
        },
      },
    },
    periodGranularity: 'day',
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
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});;
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
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});;
   `);
};

exports._meta = {
  version: 1,
};
