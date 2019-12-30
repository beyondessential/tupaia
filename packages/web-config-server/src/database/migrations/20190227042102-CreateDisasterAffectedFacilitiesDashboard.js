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
    VALUES (
      E'DR_facility_type_affected_counts',
      NULL,
      E'countDisasterAffectedFacilitiesByType',
      E'{}',
      E'{"name": "Facilities Affected","type": "view","viewType": "multiValueRow","title": "This is the impact of the current disaster","presentationOptions": {"rowHeader": {"name": "Facilities", "color": "#efeff0"},"leftColumn": {"color": "#22c7fc", "header": "Unaffected"},"rightColumn": {"color": "#db2222", "header": "Affected"},"middleColumn": {"color": "#a7a7a7", "header": "Unknown"}}}',TRUE
    );

    INSERT INTO "public"."dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code","viewMode")
    VALUES (
      E'Province',
      E'Admin',
      E'VU',
      E'{DR_facility_type_affected_counts}',
      E'Disaster Response',
      E'Disaster_Response_Province',
      E'disaster'
    );

    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"DR_facility_type_affected_counts"}' WHERE code = 'Disaster_Response_Country';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
