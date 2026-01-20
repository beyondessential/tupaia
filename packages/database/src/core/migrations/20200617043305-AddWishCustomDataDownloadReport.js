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

const DASHBOARD_GROUP_CODE = 'WISH_Export_Surveys';
const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      code: 'WISH_3CM',
      name: '3 - Community mapping',
    },
    {
      code: 'WISH_4A',
      name: '4A - Agriculture',
    },
    {
      code: 'WISH_4FAA',
      name: '4B - Fisheries and Aquaculture',
    },
    {
      code: 'WISH_4R',
      name: '4D - Recreation',
    },
    {
      code: 'WISH_4SO',
      name: '4C - Sanitation Observations',
    },
    {
      code: 'WISH_4SQ',
      name: '4C - Sanitation Questionnaire',
    },
    {
      code: 'WISH_5HO',
      name: '5A - Household Observational',
    },
    {
      code: 'WISH_5HIS',
      name: '5B Household Interview Survey',
    },
    {
      code: 'WISH_6CLD',
      name: '6 - Chemistry Test Data',
    },
    {
      code: 'WISH_6PLD',
      name: '6 - Physio Lab datasheet',
    },
    {
      code: 'WISH_6MTD',
      name: '6 - Microbiology Test Data',
    },
    {
      code: 'WISH_WMKS',
      name: 'WISH MACMON KI Survey',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        WISH_3CM: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFICM5'],
        },
        WISH_4A: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI4AGR5'],
        },
        WISH_4FAA: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI4AQU5'],
        },
        WISH_4R: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI4RA 5'],
        },
        WISH_4SO: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI4SO11', 'WFI4SO7'],
        },
        WISH_4SQ: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI4SQ11', 'WFI4SQ7', 'WFI4SQ13', 'WFI4SQ12'],
        },
        WISH_5HO: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI5HOS3', 'WFI4SQ13', 'WFI5HOS4', 'WFI5HOS5'],
        },
        WISH_5HIS: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFI5HIS17', 'WFI5HIS3', 'WFI5HIS5', 'WFI5HIS4'],
        },
        WISH_6CLD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
        },
        WISH_6PLD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
          excludeCodes: ['WFIPHDS7', 'WFIPHDS9', 'WFIPHDS8'],
        },
        WISH_6MTD: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
        },
        WISH_WMKS: {
          entityAggregation: {
            dataSourceEntityType: 'village',
          },
        },
      },
      transformations: [
        {
          type: 'ancestorMapping',
          ancestorType: 'sub_catchment',
          label: 'Sub Catchment',
          showInExport: true,
        },
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
  id: 'WISH_Custom_Export_Surveys',
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
