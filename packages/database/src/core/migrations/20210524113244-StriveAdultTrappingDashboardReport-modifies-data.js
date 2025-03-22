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

const DASHBOARD_GROUP_CODES = [
  'PG_Strive_PNG_Country',
  'PG_Strive_PNG_District',
  'PG_Strive_PNG_Facility',
];

const BASE_DASHBOARD_REPORT = {
  id: 'PG_Strive_Mosquito_Species_Distribution',
  dataBuilder: 'reportServer',
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
};

const DATA_BUILDER_CONFIG = {
  reportCode: 'PG_Strive_Mosquito_Species_Distribution_AE_AT',
};

const VIEW_JSON = {
  name: 'Distribution of mosquito species collected',
  type: 'chart',
  chartType: 'pie',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', {
    ...BASE_DASHBOARD_REPORT,
    dataBuilderConfig: DATA_BUILDER_CONFIG,
    viewJson: VIEW_JSON,
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${BASE_DASHBOARD_REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = async function (db) {
  return db.runSql(`
  DELETE FROM "dashboardReport" WHERE id = '${BASE_DASHBOARD_REPORT.id}';
  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = array_remove("dashboardReports", '${BASE_DASHBOARD_REPORT.id}')
  WHERE
  "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
