'use strict';

import { updateValues } from '../utilities';

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

const dataElementCode = 'RHFSC';
const dashboardReportId = 'UNFPA_Raw_Data_Reproductive_Health_Facility';

const previousDashboardReport = {
  dataBuilder: 'rawDataDownload',
  dataBuilderConfig: {
    surveys: [
      {
        code: 'RHFSC',
        name: 'Reproductive Health Facility Spot Check',
      },
    ],
  },
};

const newDashboardReport = {
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig: {
    surveys: [
      {
        code: dataElementCode,
        name: 'Reproductive Health Facility Spot Check',
      },
    ],
    exportDataBuilder: {
      dataBuilder: 'rawDataValues',
      dataBuilderConfig: {
        skipHeader: false,
        surveysConfig: {
          [dataElementCode]: {
            entityAggregation: {
              dataSourceEntityType: 'facility',
            },
          },
        },
        transformations: [
          {
            type: 'transposeMatrix',
          },
        ],
      },
    },
  },
};

exports.up = async function (db) {
  await updateValues(
    db,
    'dashboardReport',
    {
      dataBuilder: newDashboardReport.dataBuilder,
      dataBuilderConfig: newDashboardReport.dataBuilderConfig,
    },
    { id: dashboardReportId },
  );
};

exports.down = async function (db) {
  await updateValues(
    db,
    'dashboardReport',
    {
      dataBuilder: previousDashboardReport.dataBuilder,
      dataBuilderConfig: previousDashboardReport.dataBuilderConfig,
    },
    { id: dashboardReportId },
  );
};

exports._meta = {
  version: 1,
};
