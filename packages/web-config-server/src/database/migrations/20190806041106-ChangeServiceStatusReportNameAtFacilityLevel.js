'use strict';

import { replaceArrayValue } from '../migrationUtilities';

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

const NEW_REPORT_ID = 'TO_PEHS_Facility';

exports.up = async function(db) {

  //this makes a new report, basically a copy of the existing TO_PEHS report except for a few things
  await db.runSql(`
    INSERT INTO "dashboardReport"
    ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    SELECT "id" || '_Facility' as "id", "dataBuilder", "dataBuilderConfig", "viewJson" || '{ "name": "Service Status Of Facility" }' as "viewJson", "dataServices"
    FROM "dashboardReport"
    WHERE "id" = 'TO_PEHS';
  `);

  //this updates dashboardGroup and makes it point to the new report at Facility level
  return replaceArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    'TO_PEHS',
    NEW_REPORT_ID,
    `name = 'PEHS' AND "organisationLevel" = 'Facility'`,
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
