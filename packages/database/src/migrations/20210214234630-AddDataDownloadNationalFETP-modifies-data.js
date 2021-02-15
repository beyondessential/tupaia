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

const PG_DASHBOARD_GROUP_CODE = 'PG_FETP_Raw_Data_Downloads_Country';
const SB_DASHBOARD_GROUP_CODE = 'SB_FETP_Raw_Data_Downloads_Country';

const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      name: 'FETP Graduate Data Survey',
      code: 'FGDS',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        FGDS: {
          entityAggregation: {
            dataSourceEntityType: 'individual',
          },
        },
      },
      skipHeader: false,
    },
  },
};

const VIEW_JSON = {
  name: 'FETP Fellows Data Collection',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year',
};

const PG_REPORT = {
  id: 'PG_FETP_Cust_Exports_Fellows_Collection',
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

const SB_REPORT = {
  id: 'SB_FETP_Cust_Exports_Fellows_Collection',
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', SB_REPORT);
  await insertObject(db, 'dashboardReport', PG_REPORT);

  return db.runSql(`
    UPDATE
    "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{${PG_REPORT.id}}'
    WHERE
      "code" = '${PG_DASHBOARD_GROUP_CODE}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{${SB_REPORT.id}}'
    WHERE
      "code" = '${SB_DASHBOARD_GROUP_CODE}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${SB_REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${SB_REPORT.id}')
    WHERE
      "code" = '${SB_DASHBOARD_GROUP_CODE}';

    DELETE FROM "dashboardReport" WHERE id = '${PG_REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${PG_REPORT.id}')
    WHERE
      "code" = '${PG_DASHBOARD_GROUP_CODE}';
   `);
};

exports._meta = {
  version: 1,
};
