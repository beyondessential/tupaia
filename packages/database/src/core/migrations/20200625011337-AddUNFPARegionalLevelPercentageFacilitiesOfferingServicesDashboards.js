'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const dashBoards = [
  {
    id: 'UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning',
    dataElementCode: 'RHS4UNFPA807',
    title: '% of Facilities offering Services (Family Planning)',
  },
  {
    id: 'UNFPA_Region_Percentage_Facilities_Offering_Services_ANC',
    dataElementCode: 'RHS3UNFPA4121',
    title: '% of Facilities offering Services (ANC)',
  },
  {
    id: 'UNFPA_Region_Percentage_Facilities_Offering_Services_PNC',
    dataElementCode: 'RHS3UNFPA464',
    title: '% of Facilities offering Services (PNC)',
  },
  {
    id: 'UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery',
    dataElementCode: 'RHS3UNFPA536',
    title: '% of Facilities offering Services (Delivery)',
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
          dataElementCodes: ['RHS4UNFPA807'],
          entityAggregation: {
            dataSourceEntityType: 'facility',
            aggregationEntityType: 'country',
            aggregationType: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          },
        },
      },
      countFacilitiesSurveyed: {
        dataBuilder: 'sumValuesPerQuarterByOrgUnit',
        dataBuilderConfig: {
          dataElementCodes: ['RHS4UNFPA807'],
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
    name: '% of Facilities offering Services (Family Planning)',
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
    BASE_DASHBOARD.dataBuilderConfig.dataBuilders.countFacilitiesSurveyed.dataBuilderConfig.dataElementCodes = [
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
