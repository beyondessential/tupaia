'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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
/** 
Showing % of facilities with at least 1 staff member trained in each of the 3 service provision areas.

Dashboard title: % of Facilities with at least 1 staff member trained in Family Planning
Data source:
Numerator: # of facilities where answer to RHS4UNFPA809 is > 1
Denominator: # of facilities in the country

Dashboard title: % of Facilities with at least 1 staff member trained in Delivery
Data source:
Numerator: # of facilities where answer to RHS3UNFPA5410 is > 1
Denominator: # of facilities in the country

Dashboard title: % of Facilities with at least 1 staff member trained in SGBV service provision
Data source:
Numerator: # of facilities where answer to RHS2UNFPA292 is > 1
Denominator: # of facilities in the country
*/
const dashBoards = [
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning',
    dataElementCode: 'RHS4UNFPA809',
    title: '% of Facilities with at least 1 staff member trained in Family Planning',
  },
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery',
    dataElementCode: 'RHS3UNFPA5410',
    title: '% of Facilities with at least 1 staff member trained in Delivery',
  },
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery_SGBV',
    dataElementCode: 'RHS2UNFPA292',
    title: '% of Facilities with at least 1 staff member trained in SGBV Service Provision',
  },
];

const BASE_DASHBOARD = {
  id: 'UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning',
  dataBuilder: 'composePercentagesPerPeriodByOrgUnit',
  dataBuilderConfig: {
    percentages: {
      value: {
        numerator: 'sumFacilitiesWithServicesAvailable',
        denominator: 'countFacilitiesSurveyed',
      },
    },
    dataBuilders: {
      sumFacilitiesWithServicesAvailable: {
        dataBuilder: 'sumValuesPerQuarterByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: [],
          valueOfInterest: {
            operator: '>',
            value: 0,
          },
          entityAggregation: {
            dataSourceEntityType: 'facility',
            aggregationEntityType: 'country',
            aggregationType: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
          },
        },
      },
      countFacilitiesSurveyed: {
        dataBuilder: 'sumValuesPerQuarterByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['RHS1UNFPA03'], // We want to count all the surveyed facilities, so using 'Country' data element here which is mandatory for all the survey responses
          entityAggregation: {
            dataSourceEntityType: 'facility',
            aggregationEntityType: 'country',
            aggregationType: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
          },
        },
      },
    },
  },
  viewJson: {
    name: '% of Facilities with at least 1 staff member trained',
    type: 'chart',
    chartType: 'line',
    chartConfig: {
      $all: {
        yAxisDomain: {
          min: { type: 'number', value: 0 },
          max: { type: 'number', value: 1 },
        },
      },
    },
    valueType: 'percentage',
    labelType: 'fractionAndPercentage',
    showPeriodRange: 'dashboardOnly',
    periodGranularity: 'quarter',
  },
  dataServices: [{ isDataRegional: true }],
};

const DASHBOARD_GROUP_CODES = ['UNFPA_Project'];

exports.up = async function (db) {
  for (const dashBoard of dashBoards) {
    const { id, dataElementCode, title } = dashBoard;
    BASE_DASHBOARD.id = id;
    BASE_DASHBOARD.dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig.dataElementCodes = [
      dataElementCode,
    ];
    BASE_DASHBOARD.viewJson.name = title;
    await insertObject(db, 'dashboardReport', BASE_DASHBOARD);
    await db.runSql(`
      UPDATE
        "dashboardGroup"
      SET
        "dashboardReports" = "dashboardReports" || '{ ${BASE_DASHBOARD.id} }'
      WHERE
        "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
    `);
  }
};

exports.down = async function (db) {
  await Promise.all(
    dashBoards.map(async ({ id }) => {
      db.runSql(`
      DELETE FROM "dashboardReport" WHERE id = '${id}';

      UPDATE
        "dashboardGroup"
      SET
        "dashboardReports" = array_remove("dashboardReports", '${id}')
      WHERE
        "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
