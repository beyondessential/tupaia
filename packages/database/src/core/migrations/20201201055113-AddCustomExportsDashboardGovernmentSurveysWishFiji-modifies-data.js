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
const DASHBOARD_REPORT_ID = 'WISH_Cust_Exports_Govt_Mapping';
const DASHBOARD_GROUP_CODE = 'WISH_Export_Surveys';
const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      name: '2 - Govt mapping methods',
      code: 'WISH_2GMM',
    },
    {
      name: '2 - Govt mapping',
      code: 'WISH_2GM',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        WISH_2GM: {
          entityAggregation: {
            dataSourceEntityType: 'sub_catchment',
          },
          excludeCodes: ['WFIGM2'],
        },
        WISH_2GMM: {
          entityAggregation: {
            dataSourceEntityType: 'sub_catchment',
          },
        },
      },
      transformations: [
        { type: 'transposeMatrix' },
        { type: 'sortByColumns', columns: [['Name']] },
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
       "dashboardReports" = "dashboardReports" || '{${REPORT.id}}'
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
