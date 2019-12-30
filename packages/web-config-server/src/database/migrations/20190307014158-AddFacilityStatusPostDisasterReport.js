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
  INSERT INTO "public"."dashboardReport"(
    "id",
    "drillDownLevel",
    "dataBuilder",
    "dataBuilderConfig",
    "viewJson",
    "isDataRegional"
    )
    VALUES
    (
      E'Disaster_Response_Facilities_Affected',
      NULL,
      E'countDisasterAffectedFacilitiesByStatus',
      E'{"optionSetCode":"notaffected.partaffected.completelyaffected.na"}',
      E'{"type": "chart", "name": "Disaster Affected Facilities", "chartType": "pie", "presentationOptions": {"Not affected": {"color": "#0AB45A"},"Partially affected": {"color": "#FA7850"},"Completely affected": {"color": "#AA0A3C"},"Not applicable": {"color": "#8214A0"}, "To be completed": {"color": "#00A0FA"}}}',TRUE
    );

    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"Disaster_Response_Facilities_Affected"}' WHERE ("organisationLevel" = 'Province' OR "organisationLevel" = 'Country') AND name = 'Disaster Response';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
