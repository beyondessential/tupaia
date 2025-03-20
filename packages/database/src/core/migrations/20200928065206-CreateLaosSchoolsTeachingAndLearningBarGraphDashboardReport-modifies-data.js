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
const REPORT_ID = 'Laos_Schools_Teaching_Learning_Bar_Graph';

const BASE_SUB_BUILDER_CONFIG = {
  dataClasses: {
    'Remedial support provided to students by the school': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchFF011'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchFF011'],
      },
      sortOrder: 0,
    },
    'Support implementing catch-up/remedial teaching programmes received': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD020'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD020'],
      },
      sortOrder: 1,
    },
    'Additional learning and reading materials received since June 2020': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD004b'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD004b'],
      },
      sortOrder: 2,
    },
    'Teachers follow the MoES education programmes at home': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD016'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD016'],
      },
      sortOrder: 3,
    },
    'Students follow the MoES education programmes at home': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD017'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD017'],
      },
      sortOrder: 4,
    },
    'MoES education programmes on TV/radio/online considered useful for supporting continuity of student learning when schools were closed': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD017d'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD017d'],
      },
      sortOrder: 5,
    },
    'Training on digital literacy and MoES website resources received': {
      numerator: {
        valueOfInterest: 'Yes',
        dataValues: ['SchCVD019'],
      },
      denominator: {
        valueOfInterest: '*',
        dataValues: ['SchCVD019'],
      },
      sortOrder: 6,
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
  name: 'Teaching and Learning, % of Schools',
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
