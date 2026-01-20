import { insertObject } from '../utilities/migration';

('use strict');

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT = {
  id: 'COVID_Total_Tests_Conducted',
  dataBuilder: 'sumAllPerMetric',
  dataBuilderConfig: {
    labels: {
      dailysurvey006: 'Total tests conducted',
    },
    dataElementCodes: ['dailysurvey006'],
  },
  viewJson: {
    name: 'COVID-19 Total tests',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'number',
    presentationOptions: {
      valueFormat: '0.0a',
    },
  },
};
const DASHBOARD_GROUP_CODE = 'AU_Covid_Province';

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
