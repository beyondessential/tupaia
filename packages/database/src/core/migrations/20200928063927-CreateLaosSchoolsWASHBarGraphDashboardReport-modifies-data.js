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
const REPORT_ID = 'Laos_Schools_WASH_Bar_Graph';

const BASE_SUB_BUILDER_CONFIG = {
  dataClasses: {
    'Functioning hand washing facilities': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchFF004'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchFF004'],
      },
      sortOrder: 0,
    },
    'Access to water supply': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['BCD29_event'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['BCD29_event'],
      },
      sortOrder: 1,
    },
    'Access to water supply all year round': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD010l'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD010l'],
      },
      sortOrder: 2,
    },
    'Access to clean drinking water': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD028'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD028'],
      },
      sortOrder: 3,
    },
    'Hygiene promotion training in last 3 years': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD007'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD007'],
      },
      sortOrder: 4,
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
  name: 'Water, Sanitation and Hygiene (WASH), % Availability',
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
