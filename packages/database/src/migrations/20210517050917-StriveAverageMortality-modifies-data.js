'use strict';

import { insertObject, generateId } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Country';

const BASE_DASHBOARD_REPORT = {
  id: 'PG_Strive_Average_Mosquito_Mortality',
  dataBuilder: 'reportServer',
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
};

const DATA_BUILDER_CONFIG = {
  reportCode: 'STRIVE_Average_Mortality_AE_IR',
};

const VIEW_JSON = {
  name: 'Average Mosquito Mortality',
  type: 'chart',
  chartType: 'matrix',
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
      "code" = '${DASHBOARD_GROUP_CODE}';
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
    "code" = '${DASHBOARD_GROUP_CODE}';
`);
};

exports._meta = {
  version: 1,
};
