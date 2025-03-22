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
  id: 'COVID_TRACKING_By_Gender_by_district',
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      Males: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['COVIDVac5'],
          aggregationType: 'RAW',
          entityAggregation: {
            dataSourceEntityType: 'district',
          },
        },
      },
      Females: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['COVIDVac6'],
          aggregationType: 'RAW',
          entityAggregation: {
            dataSourceEntityType: 'district',
          },
        },
      },
      Total: {
        dataBuilder: 'composeDataPerOrgUnit',
        dataBuilderConfig: {
          dataBuilders: {
            Males: {
              dataBuilder: 'sumByOrgUnit',
              dataBuilderConfig: {
                dataElementCodes: ['COVIDVac5'],
                aggregationType: 'SUM_PER_ORG_GROUP',
                entityAggregation: {
                  dataSourceEntityType: 'district',
                  aggregationEntityType: 'country',
                },
              },
            },
            Females: {
              dataBuilder: 'sumByOrgUnit',
              dataBuilderConfig: {
                dataElementCodes: ['COVIDVac6'],
                aggregationType: 'SUM_PER_ORG_GROUP',
                entityAggregation: {
                  dataSourceEntityType: 'district',
                  aggregationEntityType: 'country',
                },
              },
            },
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
    periodGranularity: 'day',
  },
  dataServices: [{ isDataRegional: true }],
});

const dashboardGroupCodes = [
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
