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
    
  INSERT INTO "public"."dashboardReport"("id","drillDownLevel","dataBuilder","dataBuilderConfig","viewJson","isDataRegional")
  VALUES
  (
    E'SB_IHR_Bar',
    NULL,
    E'percentPerValuePerOrgGroup',
    E'{"range": [0, 1], "dataElementCodes": ["DE_GROUP-IHR_Survey"], "organisationUnitLevel": "District"}',
    E'{"name": "International Health Regulations by Province", "type": "chart", "xName": "Province", "yName": "%", "chartType": "bar", "valueType": "percentage", "presentationOptions": {"0": {"color": "#b71c1c", "label": "Red", "stackId": "1"}, "1": {"color": "#ef6c00", "label": "Orange", "stackId": "1"}, "2": {"color": "#fdd835", "label": "Yellow", "stackId": "1"}, "3": {"color": "#7cb342", "label": "Light Green", "stackId": "1"}, "4": {"color": "#33691e", "label": "Dark Green", "stackId": "1"}}}',
    TRUE
  );

  UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"SB_IHR_Bar"}' WHERE code = 'International_Health_Regulations_SB'

`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
