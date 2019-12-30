'use strict';

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

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = 'percentOperationalFacilitiesWithData',
    "dataBuilderConfig" = '{"dataElementGroupCode": "All_Survey_Dates", "monthsOfData": 6}',
    "dataSources" = '[{ "isDataRegional": true },{ "isDataRegional": false }]'
    WHERE "dataBuilder" = 'percentageInGroup';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = 'percentageInGroup',
    "dataBuilderConfig" = '{"sqlViewId": "RZaDib3dqn3", "variables": {"fromDate": "{nowMinusSixMonths}", "dataElementCode": "BCDSurveyDate", "organisationUnitCode": "{organisationUnitCode}"}}',
    "dataSources" = '[{ "isDataRegional": true }]'
    WHERE "dataBuilder" = 'percentOperationalFacilitiesWithData';
  `);
};

exports._meta = {
  version: 1,
};
