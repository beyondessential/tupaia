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
    SET "dataBuilderConfig" = '{"surveys": [{"code": "BCD", "name": "Basic Clinic Data"}, {"code": "FF", "name": "Facility Fundamentals"}, {"code": "CD", "name": "Childhood Diarrhoea"}, {"code": "DP_LEGACY", "name": "Disaster Preparedness & Response"}, {"code": "DR_PRE", "name": "Disaster Preparation"}, {"code": "DR_POST_48hours", "name": "POST Disaster 24-48 hours"}, {"code": "DR_POST_2weeks", "name": "POST Disaster within 2 weeks"}, {"code": "SARA", "name": "SARA Survey"}]}'
    WHERE "id" = 'Raw_Data_Core_Surveys';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
