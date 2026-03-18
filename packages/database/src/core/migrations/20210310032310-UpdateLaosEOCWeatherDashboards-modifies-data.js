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

const newChartConfigObserved = {
  chartConfig: {
    precip: {
      color: '#4385d8',
      label: 'Rainfall (mm)',
      chartType: 'bar',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'left',
      yName: 'Rainfall (mm)',
    },
    max_temp: {
      color: '#da1f1f',
      label: 'Maximum temperature (°C)',
      chartType: 'line',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'right',
      yName: 'Temperature (°C)',
    },
    min_temp: {
      color: '#efc038',
      label: 'Minimum temperature (°C)',
      chartType: 'line',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'right',
      yName: 'Temperature (°C)',
    },
  },
};

const newChartConfigForecast = {
  chartConfig: {
    precip: {
      color: '#4385d8',
      label: 'Forecast rainfall (mm)',
      chartType: 'bar',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'left',
      yName: 'Rainfall (mm)',
    },
    max_temp: {
      color: '#da1f1f',
      label: 'Forecast maximum temperature (°C)',
      chartType: 'line',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'right',
      yName: 'Temperature (°C)',
    },
    min_temp: {
      color: '#efc038',
      label: 'Forecast minimum temperature (°C)',
      chartType: 'line',
      valueType: 'oneDecimalPlace',
      yAxisOrientation: 'right',
      yName: 'Temperature (°C)',
    },
  },
};

const newName = {
  name: 'Daily Total Rainfall (mm) and Observed Temperature (°C)',
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '${JSON.stringify(newName)}'
    WHERE "id" = 'LA_EOC_Observed_Daily_Rainfall_And_Temperature';
  `);

  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '${JSON.stringify(newChartConfigObserved)}'
    WHERE "id" = 'LA_EOC_Observed_Daily_Rainfall_And_Temperature';
  `);

  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '${JSON.stringify(newChartConfigForecast)}'
    WHERE "id" = 'LA_EOC_Forecast_Daily_Rainfall_And_Temperature';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
