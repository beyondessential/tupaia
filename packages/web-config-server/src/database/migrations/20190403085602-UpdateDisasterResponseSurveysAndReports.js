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
    SET "dataBuilder" = 'disasterSurveyResponseDownloads', "dataBuilderConfig" = '{"preConfig":{"surveyCodes":["DR_PRE", "DP_LEGACY"], "name":"Download Disaster Preparation Survey Response",  "dataElementGroupCode":"DR_PRESurveyDate"}, "postConfig":{"surveyCodes":["DR_POST_48hours", "DR_POST_2weeks"], "name":"Download Post Disaster Survey Response",  "dataElementGroupCode":"DR_POSTSurveyDate"}}'
    WHERE id = '31';
    
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{"dataElementGroupCode": "DP_WE_Damage", "surveyDataElementCode": "DR_POSTSurveyDate"}'
    WHERE id = '35';
    
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{"dataElementGroupCode": "DPR_Photos", "surveyDataElementCode": "DR_POSTSurveyDate"}'
    WHERE id = '32';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
