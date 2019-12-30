'use strict';

import { insertObject } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT = {
  id: 'VU_IMMS_BIRTHS',
  name: 'Births over time',
  periodGranularity: 'month',
  isDataRegional: false,
};

const DASHBOARD = {
  code: 'VU_IMMS_BIRTHS',
  name: 'Vanuatu Births',
};

exports.up = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = '${REPORT.id}';
    DELETE FROM "dashboardGroup" WHERE "code" = '${DASHBOARD.code}';
  `);
};

exports.down = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'sumPerMonth',
    dataBuilderConfig: {
      dataSource: {
        type: 'single',
        codes: ['VU_BIRTHS'],
      },
    },
    viewJson: {
      name: REPORT.name,
      type: 'chart',
      chartType: 'line',
      periodGranularity: REPORT.periodGranularity,
      valueType: 'text',
    },
    dataServices: [{ isDataRegional: REPORT.isDataRegional }],
  });

  return insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Country',
    userGroup: 'Super Admin',
    organisationUnitCode: 'VU',
    dashboardReports: `{${REPORT.id}}`,
    name: DASHBOARD.name,
    code: DASHBOARD.code,
  });
};

exports._meta = {
  version: 1,
};
