'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const getDashboardConfig = () => ({
  id: 'COVID_TRACKING_By_Gender',
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      Males: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['COVIDVac5'],
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
        },
      },
      Females: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['COVIDVac6'],
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
        },
      },
    },
  },
  viewJson: {
    name: 'Number of people fully vaccinated for COVID-19 (by sex)',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      Males: {
        stackId: 1,
      },
      Females: {
        stackId: 2,
      },
    },
    periodGranularity: 'one_day_at_a_time',
  },
  dataServices: [{ isDataRegional: true }],
});

const dashboardGroupCodes = [
  // Samoa
  'WS_Covid_Samoa_Country_COVID-19',
  // Fiji
  'FJ_Covid_Fiji_Country_COVID-19',
  // Nauru
  'NR_Covid_Nauru_Country_COVID-19',
];

exports.up = async function (db) {
  const dashboardConfig = getDashboardConfig();
  await insertObject(db, 'dashboardReport', dashboardConfig);
  await db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = "dashboardReports" || '{${dashboardConfig.id}}'
    where "code" in (${arrayToDbString(dashboardGroupCodes)});
  `);
  return dashboardConfig;
};

exports.down = function (db) {
  const dashboardConfig = getDashboardConfig();
  return db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = array_remove("dashboardReports", '${dashboardConfig.id}')
    where "code" in (${arrayToDbString(dashboardGroupCodes)});

    delete from "dashboardReport" where "id" = '${dashboardConfig.id}';
  `);
};

exports._meta = {
  version: 1,
};
