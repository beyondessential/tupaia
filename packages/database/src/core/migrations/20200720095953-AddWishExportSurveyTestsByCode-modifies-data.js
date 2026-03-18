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

/**
 * 3 surveys combined on question (code)
 * "6 - Chemistry Test Data" - WISH_6CLD (WFIPDS2)
 * "6 - Physio Lab datasheet" - WISH_6PLD (WFIPHDS3)
 * "6 - Microbiology Test Data" - WISH_6MTD (WFIBDS2)
 */
const DASHBOARD_REPORT_ID = 'WISH_Custom_Export_Combined_Test_Surveys';
const DASHBOARD_GROUP_CODE = 'WISH_Export_Surveys';
const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      name: 'Aligned Sample Tests',
      codes: ['WISH_6CLD', 'WISH_6PLD', 'WISH_6MTD'],
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        WISH_6CLD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          mergeRowKey: 'WFIPDS2',
        },
        WISH_6PLD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFIPHDS7', 'WFIPHDS9', 'WFIPHDS8'],
          mergeRowKey: 'WFIPHDS3',
        },
        WISH_6MTD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          mergeRowKey: 'WFIBDS2',
        },
      },
      transformations: [
        {
          type: 'ancestorMapping',
          ancestorType: 'sub_catchment',
          label: 'Sub Catchment',
          showInExport: true,
        },
        { type: 'mergeSurveys', mergedTableName: 'Aligned Sample Tests' },
        { type: 'transposeMatrix' },
        { type: 'sortByColumns', columns: [['Sub Catchment'], ['Name'], ['Date']] },
      ],
      skipHeader: false,
    },
  },
};

const VIEW_JSON = {
  name: 'Download WISH Survey Data',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year',
};

const REPORT = {
  id: DASHBOARD_REPORT_ID,
  dataBuilder: 'surveyDataExport',
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
       "code" = '${DASHBOARD_GROUP_CODE}';
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
       "code" = '${DASHBOARD_GROUP_CODE}';
   `);
};

exports._meta = {
  version: 1,
};
