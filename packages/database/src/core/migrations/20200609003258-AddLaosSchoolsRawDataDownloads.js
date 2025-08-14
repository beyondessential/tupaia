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

const REPORT_ID = 'Laos_Schools_Raw_Data_Downloads';

const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      code: 'SC1RL',
      name: 'School COVID-19 Response Laos',
    },
    {
      code: 'SPDL',
      name: 'School Dev Partners Laos',
    },
    {
      code: 'SPAL',
      name: 'School Partner Assistance Laos',
    },
    {
      code: 'SFL',
      name: 'School Fundamentals Laos',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        SC1RL: {
          entityAggregation: {
            dataSourceEntityType: 'school',
          },
        },
        SPDL: {
          entityAggregation: {
            dataSourceEntityType: 'school',
          },
        },
        SPAL: {
          entityAggregation: {
            dataSourceEntityType: 'country',
          },
        },
        SFL: {
          entityAggregation: {
            dataSourceEntityType: 'school',
          },
        },
      },
    },
  },
};

const VIEW_JSON = {
  name: 'Download Laos Schools Raw Data',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'month',
};

const DASHBOARD_REPORT = {
  id: REPORT_ID,
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

const DASHBOARD_GROUPS = [
  'LA_Laos_Schools_Country_Laos_Schools_Super_User',
  'LA_Laos_Schools_Province_Laos_Schools_Super_User',
  'LA_Laos_Schools_District_Laos_Schools_Super_User',
];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports._meta = {
  version: 1,
};
