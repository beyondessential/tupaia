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

const DASHBOARD_GROUP = {
  organisationLevel: 'Country',
  userGroup: 'COVID-19',
  organisationUnitCode: 'WS',
  name: 'COVID-19',
  code: 'WS_Covid_Country',
};

const REPORT = {
  id: 'Raw_Data_Samoa_Covid_Surveys',
  dataBuilder: 'rawDataDownload',
  dataBuilderConfig: {
    surveys: [
      {
        code: 'SC1HA',
        name: 'Samoa COVID-19 Household Assessment',
      },
      {
        code: 'SC1CS',
        name: 'Samoa COVID-19 Clinical Surveillance',
      },
      {
        code: 'SC1PFA',
        name: 'Samoa COVID-19 Public Facility Assessment',
      },
    ],
  },
  viewJson: {
    name: 'Download COVID-19 Survey Data',
    type: 'view',
    viewType: 'dataDownload',
    periodGranularity: 'day',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP.code}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
    DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';
  `);
};

exports._meta = {
  version: 1,
};
