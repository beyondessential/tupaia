'use strict';

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

exports.up = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = '{
    "labels": {
      "dailysurvey003": "Total confirmed cases",
      "dailysurvey004": "Total deaths"
    },
    "dataElementCodes": [
      "dailysurvey003",
      "dailysurvey004"
    ]
  }'
  where "id" = 'COVID_Total_Cases_By_Type';

  update "dashboardReport"
  set "dataBuilderConfig" = '{
    "labels": {
      "dailysurvey003": "New confirmed cases today",
      "dailysurvey004": "New deaths today"
    },
    "dataElementCodes": [
      "dailysurvey003",
      "dailysurvey004"
    ]
  }'
  where "id" = 'COVID_Daily_Cases_By_Type';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = '{
    "labels": {
      "dailysurvey003": "Total confirmed cases",
      "dailysurvey004": "Total deaths",
      "dailysurvey005": "Total confirmed recoveries"
    },
    "dataElementCodes": [
      "dailysurvey003",
      "dailysurvey004",
      "dailysurvey005"
    ]
  }'
  where "id" = 'COVID_Total_Cases_By_Type';

  update "dashboardReport"
  set "dataBuilderConfig" = '{
    "labels": {
      "dailysurvey003": "New confirmed cases today",
      "dailysurvey004": "New deaths today",
      "dailysurvey005": "New confirmed recoveries today"
    },
    "dataElementCodes": [
      "dailysurvey003",
      "dailysurvey004",
      "dailysurvey005"
    ]
  }'
  where "id" = 'COVID_Daily_Cases_By_Type';
  `);
};

exports._meta = {
  version: 1,
};
