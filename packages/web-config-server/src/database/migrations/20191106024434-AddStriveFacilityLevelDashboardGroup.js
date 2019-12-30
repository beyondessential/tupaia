'use strict';

import { insertObject, updateValues } from '../migrationUtilities';

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

exports.up = async function(db) {
  // Update 'PG_Strive_PNG' to 'PG_Strive_PNG_Country', create 'PG_Strive_PNG_Facility'
  // and move 'PG_Strive_PNG_Weekly_Reported_Cases' from country to facility level
  await updateValues(
    db,
    'dashboardGroup',
    {
      code: 'PG_Strive_PNG_Country',
      dashboardReports: '{PG_Strive_PNG_Case_Report_Form_Export}',
    },
    "code = 'PG_Strive_PNG'",
  );

  return insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Facility',
    userGroup: 'Strive PNG',
    organisationUnitCode: 'PG',
    dashboardReports: '{PG_Strive_PNG_Weekly_Reported_Cases}',
    name: 'Strive PNG',
    code: 'PG_Strive_PNG_Facility',
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
