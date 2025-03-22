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

const OLD_DASHBOARD_ID = 'COVID_TRACKING_By_Gender_by_district';

const FJ_DASHBOARD_ID = 'FJ_COVID_TRACKING_By_Gender_Country';
const NR_DASHBOARD_ID = 'NR_COVID_TRACKING_By_Gender_Country';

const FJ_DASHBOARD_GROUP_CODE = 'FJ_Covid_Fiji_Country_COVID-19';
const NR_DASHBOARD_GROUP_CODE = 'NR_Covid_Nauru_Country_COVID-19';

const DASHBOARD_OBJECT = {
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      Males: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          aggregationType: 'FINAL_EACH_DAY',
          dataElementCodes: ['COVIDVac5'],
          entityAggregation: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'district',
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
                aggregationType: 'FINAL_EACH_DAY',
                dataElementCodes: ['COVIDVac5'],
                entityAggregation: {
                  dataSourceEntityType: 'sub_district',
                  aggregationEntityType: 'country',
                },
              },
            },
            Females: {
              dataBuilder: 'sumByOrgUnit',
              dataBuilderConfig: {
                aggregationType: 'FINAL_EACH_DAY',
                dataElementCodes: ['COVIDVac6'],
                entityAggregation: {
                  dataSourceEntityType: 'sub_district',
                  aggregationEntityType: 'country',
                },
              },
            },
          },
        },
      },
      Females: {
        dataBuilder: 'sumByOrgUnit',
        dataBuilderConfig: {
          aggregationType: 'FINAL_EACH_DAY',
          dataElementCodes: ['COVIDVac6'],
          entityAggregation: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'district',
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
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${OLD_DASHBOARD_ID}')
    WHERE code IN (${arrayToDbString([FJ_DASHBOARD_GROUP_CODE, NR_DASHBOARD_GROUP_CODE])});
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" 
    WHERE id = '${OLD_DASHBOARD_ID}';
  `);

  await insertObject(db, 'dashboardReport', {
    id: FJ_DASHBOARD_ID,
    ...DASHBOARD_OBJECT,
  });

  await insertObject(db, 'dashboardReport', {
    id: NR_DASHBOARD_ID,
    ...DASHBOARD_OBJECT,
  });

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${FJ_DASHBOARD_ID}}'
    WHERE code = '${FJ_DASHBOARD_GROUP_CODE}';
  `);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${NR_DASHBOARD_ID}}'
    WHERE code = '${NR_DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
