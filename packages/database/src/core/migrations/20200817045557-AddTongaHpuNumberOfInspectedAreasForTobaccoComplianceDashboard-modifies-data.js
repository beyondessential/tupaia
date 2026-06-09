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

const DASHBOARD_GROUP = 'TO_Health_Promotion_Unit_Country';
const DASHBOARD = {
  id: 'TO_HPU_Number_Of_Inspected_Areas_For_Tobacco_Compliance',
  dataBuilder: 'sum',
  dataBuilderConfig: {
    aggregationType: 'SUM',
    dataElementCodes: ['HP253'],
  },
  viewJson: {
    name: 'Number of Public Areas Inspected for Tobacco Compliance',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'number',
    periodGranularity: 'one_year_at_a_time',
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD);

  return db.runSql(`
     UPDATE "dashboardGroup"
     SET "dashboardReports" = "dashboardReports" || '{ ${DASHBOARD.id} }'
     WHERE "code" = '${DASHBOARD_GROUP}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${DASHBOARD.id}';

     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD.id}')
     WHERE "code" = '${DASHBOARD_GROUP}';
   `);
};

exports._meta = {
  version: 1,
};
