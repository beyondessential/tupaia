'use strict';

import { insertObject } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const REPORT = {
  id: 'TO_Total_Screened_For_NCD_Risk_Factors',
  dataBuilder: 'countEvents',
  dataBuilderConfig: {
    programCode: 'HP02',
  },
  viewJson: {
    name: 'Total screened for NCD risk factors',
    type: 'view',
    viewType: 'singleValue',
    periodGranularity: 'one_year_at_a_time',
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
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
