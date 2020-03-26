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
    INSERT INTO "dashboardReport" (
      "id",
      "dataBuilder",
      "dataBuilderConfig",
      "viewJson",
      "dataServices"
      )
      
      VALUES (
        'COVID_AU_Daily_Cases_Each_State_Over_Time',
        'finalValuesPerDayByOrgUnit',
        '{"labels":{"AU_NT":"NT","AU_SA":"SA","AU_UN":"UN","AU_WA":"WA","total":"Total","AU_ACT":"ACT","AU_NSW":"NSW","AU_QLD":"QLD","AU_TAS":"TAS","AU_VIC":"VIC"},"includeTotal":"true","dataElementCodes":["dailysurvey003"]}',
        '{"name":"Daily confirmed cases by State","type":"chart","chartType":"line","chartConfig":{"NT":{},"SA":{},"UN":{},"WA":{},"ACT":{},"NSW":{},"QLD":{},"TAS":{},"VIC":{},"Total":{}},"description":"Confirmed cases reported each day for each State and Territory","periodGranularity":"day"}',
        '[{"isDataRegional": false}]');
  `);
};

exports.down = function(db) {
  return db.runSql(`
  DELETE FROM 
    "dashboardReport"
  WHERE 
    id='COVID_AU_Daily_Cases_Each_State_Over_Time';
  `);
};

exports._meta = {
  version: 1,
};
