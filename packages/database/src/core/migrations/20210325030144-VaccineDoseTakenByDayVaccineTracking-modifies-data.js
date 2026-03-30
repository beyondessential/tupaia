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

const dashboardGroups = [
  //  Fiji
  {
    code: 'FJ_Covid_Fiji_Country_COVID-19',
    aggregationEntityType: 'country',
    dataSourceEntityType: 'district',
  },
  {
    code: 'FJ_Covid_Fiji_District_COVID-19',
    dataSourceEntityType: 'district',
  },
  // Samoa
  {
    code: 'WS_Covid_Samoa_Country_COVID-19',
    aggregationEntityType: 'country',
    dataSourceEntityType: 'village',
  },
  {
    code: 'WS_Covid_Samoa_District_COVID-19',
    aggregationEntityType: 'district',
    dataSourceEntityType: 'village',
  },
  {
    code: 'WS_Covid_Samoa_Village_COVID-19',
    dataSourceEntityType: 'village',
  },
  // Nauru
  {
    code: 'NR_Covid_Nauru_Country_COVID-19',
    aggregationEntityType: 'country',
    dataSourceEntityType: 'district',
  },
  {
    code: 'NR_Covid_Nauru_District_COVID-19',
    dataSourceEntityType: 'district',
  },
];

const dataElements = [
  { code: 'COVIDVac4', name: '1st' },
  { code: 'COVIDVac8', name: '2nd' },
];

const generateReport = (
  dashboardGroupCode,
  aggregationEntityType,
  dataSourceEntityType,
  doseName,
  dataElementCode,
) => {
  const entityAggregation = {
    dataSourceEntityType,
  };
  if (aggregationEntityType) entityAggregation.aggregationEntityType = aggregationEntityType;

  return {
    id: `${dashboardGroupCode}_Num_Of_${doseName}_Vaccine_Dose_Taken`, //
    dataBuilder: 'sumPerPeriod',
    dataBuilderConfig: {
      dataClasses: {
        value: {
          codes: [dataElementCode],
        },
      },
      aggregationType: 'FINAL_EACH_DAY',
      entityAggregation,
    },
    viewJson: {
      name: `Number of people received ${doseName} dose of COVID-19 vaccine by day`,
      type: 'chart',
      chartType: 'bar',
      periodGranularity: 'day',
      presentationOptions: { hideAverage: true },
    },
  };
};

exports.up = async function (db) {
  for (const {
    code: dashboardGroupCode,
    aggregationEntityType,
    dataSourceEntityType,
  } of dashboardGroups) {
    for (const { code: dataElementCode, name: doseName } of dataElements) {
      const report = generateReport(
        dashboardGroupCode,
        aggregationEntityType,
        dataSourceEntityType,
        doseName,
        dataElementCode,
      );
      await insertObject(db, 'dashboardReport', report);
      await db.runSql(`
        UPDATE
          "dashboardGroup"
        SET
          "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
        WHERE
          "code" = '${dashboardGroupCode}';
      `);
    }
  }
};

exports.down = async function (db) {
  for (const {
    code: dashboardGroupCode,
    aggregationEntityType,
    dataSourceEntityType,
  } of dashboardGroups) {
    for (const { code: dataElementCode, name: doseName } of dataElements) {
      const report = generateReport(
        dashboardGroupCode,
        aggregationEntityType,
        dataSourceEntityType,
        doseName,
        dataElementCode,
      );
      await db.runSql(`
        DELETE FROM "dashboardReport" WHERE id = '${report.id}';

        UPDATE
          "dashboardGroup"
        SET
          "dashboardReports" = array_remove("dashboardReports", '${report.id}')
        WHERE
          "code" = '${dashboardGroupCode}';
      `);
    }
  }
};

exports._meta = {
  version: 1,
};
