'use strict';

import { insertObject, arrayToDbString } from '../migrationUtilities';

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

const CONTRACEPTIVES_REPORT = {
  id: 'UNFPA_RH_Contraceptives_Offered',
  name: 'Contraceptives Offered',
};
const SERVICES_REPORT = {
  id: 'UNFPA_RH_Services_Offered',
  name: 'Services Offered',
};
const DASHBOARD_GROUP_CODES = ['MH_Unfpa_Facility', 'WS_Unfpa_Facility'];

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: CONTRACEPTIVES_REPORT.id,
    dataBuilder: 'sumLatestPerMetric',
    dataBuilderConfig: {
      dataElementCodes: ['RHS6UNFPA1355', 'RHS6UNFPA1354'],
    },
    viewJson: {
      name: CONTRACEPTIVES_REPORT.name,
      type: 'view',
      viewType: 'multiValue',
      valueType: 'boolean',
    },
  });

  await insertObject(db, 'dashboardReport', {
    id: SERVICES_REPORT.id,
    dataBuilder: 'sumLatestPerMetric',
    dataBuilderConfig: {
      dataElementCodes: ['RHS4UNFPA807', 'RHS3UNFPA4121', 'RHS3UNFPA464', 'RHS3UNFPA536'],
    },
    viewJson: {
      name: SERVICES_REPORT.name,
      type: 'view',
      viewType: 'multiValue',
      valueType: 'boolean',
    },
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${CONTRACEPTIVES_REPORT.id}, ${
    SERVICES_REPORT.id
  } }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${CONTRACEPTIVES_REPORT.id}';
    DELETE FROM "dashboardReport" WHERE id = '${SERVICES_REPORT.id}';
  
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${CONTRACEPTIVES_REPORT.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});

      UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${SERVICES_REPORT.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};
exports._meta = {
  version: 1,
};
