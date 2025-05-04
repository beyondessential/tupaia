'use strict';

import { cloneDeep } from 'lodash';
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

const HISTORIC_DASHBOARD_REPORT = {
  id: 'LA_EOC_Observed_Daily_Rainfall_And_Temperature',
  dataBuilder: 'composeDataPerPeriod',
  dataBuilderConfig: {
    dataBuilders: {
      precip: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['WTHR_PRECIP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
      max_temp: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['WTHR_MAX_TEMP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
      min_temp: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: { value: { codes: ['WTHR_MIN_TEMP'] } },
          aggregationType: 'FINAL_EACH_DAY',
          entityAggregation: { dataSourceEntityType: 'city' },
        },
      },
    },
  },
  viewJson: {
    name: 'Observed Daily Rainfall (mm) and Temperature (°C)',
    type: 'chart',
    chartType: 'composed',
    chartConfig: {
      precip: {
        color: '#4385d8',
        label: 'Rainfall (mm)',
        chartType: 'bar',
        valueType: 'oneDecimalPlace',
        yAxisOrientation: 'left',
      },
      max_temp: {
        color: '#da1f1f',
        label: 'Maximum temperature (°C)',
        chartType: 'line',
        valueType: 'oneDecimalPlace',
        yAxisOrientation: 'right',
      },
      min_temp: {
        color: '#efc038',
        label: 'Minimum temperature (°C)',
        chartType: 'line',
        valueType: 'oneDecimalPlace',
        yAxisOrientation: 'right',
      },
    },
    defaultTimePeriod: { start: { unit: 'day', offset: -31 }, end: { unit: 'day', offset: -1 } },
    datePickerLimits: { start: { unit: 'day', offset: -365 }, end: { unit: 'day', offset: -1 } },
    periodGranularity: 'day',
  },
  dataServices: [],
};

const FORECAST_DASHBOARD_REPORT = cloneDeep(HISTORIC_DASHBOARD_REPORT);
FORECAST_DASHBOARD_REPORT.id = 'LA_EOC_Forecast_Daily_Rainfall_And_Temperature';
FORECAST_DASHBOARD_REPORT.dataBuilderConfig.dataBuilders.precip.dataBuilderConfig.dataClasses.value.codes = [
  'WTHR_FORECAST_PRECIP',
];
FORECAST_DASHBOARD_REPORT.dataBuilderConfig.dataBuilders.max_temp.dataBuilderConfig.dataClasses.value.codes = [
  'WTHR_FORECAST_MAX_TEMP',
];
FORECAST_DASHBOARD_REPORT.dataBuilderConfig.dataBuilders.min_temp.dataBuilderConfig.dataClasses.value.codes = [
  'WTHR_FORECAST_MIN_TEMP',
];
FORECAST_DASHBOARD_REPORT.viewJson.name = 'Forecast Daily Rainfall (mm) and Temperature (°C)';
FORECAST_DASHBOARD_REPORT.viewJson.chartConfig.precip.label = 'Forecast rainfall (mm)';
FORECAST_DASHBOARD_REPORT.viewJson.chartConfig.max_temp.label = 'Forecast maximum temperature (°C)';
FORECAST_DASHBOARD_REPORT.viewJson.chartConfig.min_temp.label = 'Forecast minimum temperature (°C)';
FORECAST_DASHBOARD_REPORT.viewJson.defaultTimePeriod = {
  start: { unit: 'day', offset: 0 },
  end: { unit: 'day', offset: 15 },
};
FORECAST_DASHBOARD_REPORT.viewJson.datePickerLimits = {
  start: { unit: 'day', offset: 0 },
  end: { unit: 'day', offset: 15 },
};

const DASHBOARD_GROUP = {
  organisationLevel: 'City',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: `{${HISTORIC_DASHBOARD_REPORT.id}, ${FORECAST_DASHBOARD_REPORT.id}}`,
  name: 'Weather Observations/Forecast',
  code: 'LAOS_EOC_City_Weather',
  projectCodes: `{laos_eoc}`,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);

  await insertObject(db, 'dashboardReport', HISTORIC_DASHBOARD_REPORT);
  await insertObject(db, 'dashboardReport', FORECAST_DASHBOARD_REPORT);

  return null;
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';`);

  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${HISTORIC_DASHBOARD_REPORT.id}';`);
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${FORECAST_DASHBOARD_REPORT.id}';`);

  return null;
};

exports._meta = {
  version: 1,
};
