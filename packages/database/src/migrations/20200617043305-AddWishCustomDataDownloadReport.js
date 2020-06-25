'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DASHBOARD_GROUP_CODE = 'WISH_Export_Surveys';

const EXCLUDE_CODES = [
  'FDCIBEA5004', 
  'FDCIBEA5010',
  'WFIGM2',
  'WFI5HIS17',
  'WFI4SO7',
  'WFI4AGR5',
  'WFI4AQU5',
  'WFICM5',
  'WFI4RA 5',
  'WFI4SQ7',
  'WFIGM2',
  'WFI4SO11',
  'WFI4SQ11',
  'WFI5HOS3',
  'WFI5HIS3',
];

const DATA_BUILDER_CONFIG = {
  // dataBuilder: 'restrictedSurveyDownload',
  surveys: [
    { code: 'WISH_2GM', name: '2 - Government mapping' },
    { code: 'WISH_2GMM', name: '2 - Government mapping methods' },
    { code: 'WISH_3CM', name: '3 - Community mapping' },
    { code: 'WISH_4A', name: '4A - Agriculture' },
    { code: 'WISH_4FAA', name: '4B - Fisheries and Aquaculture' },
    { code: 'WISH_4R', name: '4D - Recreation' },
    { code: 'WISH_4SO', name: '4C - Sanitation Observations' },
    { code: 'WISH_4SQ', name: '4C - Sanitation Questionnaire' },
    { code: 'WISH_5HO', name: '5A - Household Observational' },
    { code: 'WISH_5HIS', name: '5B Household Interview Survey' },
    { code: 'WISH_6CLD', name: '6 - Chemistry Test Data' },
    { code: 'WISH_6PLD', name: '6 - Physio Lab datasheet' },
    { code: 'WISH_6MTD', name: '6 - Microbiology Test Data' },
    { code: 'WISH_WMKS', name: 'WISH MACMON KI Survey' },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      entityAggregation: {
        dataSourceEntityType: [ "village", "facility" ],
      },
      excludeCodes: EXCLUDE_CODES,
      transformations: ['transpose']
    },
  }
};

const VIEW_JSON = {
  name: 'Download WISH Survey Data',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year'
};

const REPORT = {
  id: 'WISH_Custom_Export_Surveys',
  dataBuilder: 'surveyDataExport', //
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function(db) {
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

exports.down = function(db) {
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


