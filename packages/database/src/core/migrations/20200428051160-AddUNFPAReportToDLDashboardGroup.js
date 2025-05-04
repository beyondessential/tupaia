'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const DASHBOARD_GROUP_CODES = [
  'DL_Unfpa_Facility',
  'TO_Unfpa_Facility',
  'VU_Unfpa_Facility',
  'KI_Unfpa_Facility',
  'SB_Unfpa_Facility',
];

const REPORT_ID = 'UNFPA_RH_Products_MOS';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
  WHERE
    "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports.down = function (db) {
  return db.runSql(`
  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
  WHERE
    "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports._meta = {
  version: 1,
};
