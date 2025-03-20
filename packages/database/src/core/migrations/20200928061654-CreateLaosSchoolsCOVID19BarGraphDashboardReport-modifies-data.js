'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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

const PRE_SCHOOL = 'Pre-School';
const PRIMARY_SCHOOL = 'Primary';
const SECONDARY_SCHOOL = 'Secondary';
const DASHBOARD_GROUP_CODES = [
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
];
const REPORT_ID = 'Laos_Schools_COVID_19_Bar_Graph';

const BASE_SUB_BUILDER_CONFIG = {
  dataClasses: {
    'COVID-19 posters and materials received': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD006'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD006'],
      },
      sortOrder: 0,
    },
    'School implementing MoES safe school protocols/guidelines': {
      numerator: {
        valueOfInterest: {
          value: 'Yes',
          operator: 'regex',
        },
        dataValues: ['SchCVD027'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD027'],
      },
      sortOrder: 1,
    },
    'Thermometer(s) received': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD024'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD024'],
      },
      sortOrder: 2,
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const DATA_BUILDER_CONFIG = {
  dataBuilders: {
    [PRE_SCHOOL]: {
      dataBuilder: 'percentagesOfValueCounts',
      dataBuilderConfig: {
        ...BASE_SUB_BUILDER_CONFIG,
        dataSourceEntityFilter: {
          attributes: {
            type: PRE_SCHOOL,
          },
        },
      },
    },
    [PRIMARY_SCHOOL]: {
      dataBuilder: 'percentagesOfValueCounts',
      dataBuilderConfig: {
        ...BASE_SUB_BUILDER_CONFIG,
        dataSourceEntityFilter: {
          attributes: {
            type: PRIMARY_SCHOOL,
          },
        },
      },
    },
    [SECONDARY_SCHOOL]: {
      dataBuilder: 'percentagesOfValueCounts',
      dataBuilderConfig: {
        ...BASE_SUB_BUILDER_CONFIG,
        dataSourceEntityFilter: {
          attributes: {
            type: SECONDARY_SCHOOL,
          },
        },
      },
    },
  },
};

const VIEW_JSON = {
  name: 'COVID-19, % of Schools',
  description:
    'This report is calculated based on the number of ‘School COVID-19 Response Laos’ survey responses',
  type: 'chart',
  chartType: 'bar',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  periodGranularity: 'month',
  chartConfig: {
    [PRE_SCHOOL]: {
      legendOrder: 1,
    },
    [PRIMARY_SCHOOL]: {
      legendOrder: 2,
    },
    [SECONDARY_SCHOOL]: {
      legendOrder: 3,
    },
  },
  presentationOptions: { hideAverage: true },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'composeDataPerDataClass',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
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
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
