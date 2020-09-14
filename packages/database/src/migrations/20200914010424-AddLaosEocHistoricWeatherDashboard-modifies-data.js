'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DASHBOARD_GROUP_CODE = 'LAOS_EOC_City_Weather';

const DASHBOARD_REPORT = {
  id: 'LA_EOC_Daily_Rainfall_And_Temperature',
  dataBuilder: 'composeDataPerPeriod',
  dataBuilderConfig: {
    dataBuilders: {
      precip: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['PRECIP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
      max_temp: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['MAX_TEMP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
      min_temp: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['MIN_TEMP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
    },
  },
  viewJson: {
    name: 'Daily Rainfall (mm) and Temperature (°C)',
    type: 'chart',
    chartType: 'composed',
    chartConfig: {
      precip: {
        color: '#4385d8',
        label: 'Rainfall (mm)',
        chartType: 'bar',
        valueType: 'number',
        yAxisOrientation: 'left',
      },
      max_temp: {
        color: '#da1f1f',
        label: 'Maximum temperature (°C)',
        chartType: 'line',
        valueType: 'number',
        yAxisOrientation: 'right',
      },
      min_temp: {
        color: '#efc038',
        label: 'Minimum temperature (°C)',
        chartType: 'line',
        valueType: 'number',
        yAxisOrientation: 'right',
      },
    },
    defaultTimePeriod: { start: { unit: 'year', offset: -1 } },
    periodGranularity: 'day',
  },
  dataServices: [],
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" || '{${DASHBOARD_REPORT.id}}' 
    WHERE "code" = '${DASHBOARD_GROUP_CODE}';
  `);

  return null;
};

exports.down = async function(db) {
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${DASHBOARD_REPORT.id}';`);

  await db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT.id}') 
    WHERE "code" = '${DASHBOARD_GROUP_CODE}';
  `);

  return null;
};

exports._meta = {
  version: 1,
};
