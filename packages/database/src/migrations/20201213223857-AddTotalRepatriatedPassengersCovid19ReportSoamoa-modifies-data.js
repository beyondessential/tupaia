'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT = {
  id: 'COVID_Total_Repatriated_Passengers',
  dataBuilder: 'analytics',
  dataBuilderConfig: {
    dataElementCodes: ['QMIA025'],
    entityAggregation: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'country',
      aggregationType: 'COUNT_PER_ORG_GROUP',
    },
  },
  viewJson: {
    name: 'Total Number of Repatriated Passengers (COVID-19)',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'number',
  },
};
const DASHBOARD_GROUP_CODE = 'WS_Covid_Samoa_Country';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
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
