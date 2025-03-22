'use strict';

import { removeArrayValue } from '../utilities';

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

const NEW_REPORT_IDS = [
  'SCRF_RDT_Positive_Results',
  'PG_Strive_PNG_Weekly_mRDT_Positive',
  'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases',
];

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Village';

exports.up = async function (db) {
  return db.runSql(
    `
      UPDATE
        "dashboardGroup"
      SET
        "dashboardReports" = "dashboardReports" || '{${NEW_REPORT_IDS}}'
      WHERE
        "code" = '${DASHBOARD_GROUP_CODE}'
    `,
  );
};

exports.down = async function (db) {
  return Promise.all(
    NEW_REPORT_IDS.map(reportId =>
      removeArrayValue(
        db,
        'dashboardGroup',
        'dashboardReports',
        reportId,
        `"code" = '${DASHBOARD_GROUP_CODE}'`,
      ),
    ),
  );
};

exports._meta = {
  version: 1,
};
