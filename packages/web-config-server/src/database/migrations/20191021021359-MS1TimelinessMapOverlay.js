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
  INSERT INTO "public"."mapOverlay"("id","name","groupName","userGroup","dataElementCode","displayType","customColors","isDataRegional","values","hideFromMenu","hideFromPopup","hideFromLegend","linkedMeasures","sortOrder","measureBuilderConfig","measureBuilder","presentationOptions","countryCodes")
    VALUES
      (E'MS1_COMPLETENESS',E'MS1 Completeness',E'MS1 Administration',E'Admin',E'MS1_Survey_Dates',E'spectrum',NULL,FALSE,NULL,FALSE,FALSE,FALSE,NULL,12,E'{"level": "Facility", "dataSourceType": "group", "periodGranularity": "MONTH", "periodRange": 2}',E'checkTimeliness',E'{"scaleType": "time", "noDataColour": "#99237f"}',E'{KI}');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "public"."mapOverlay" WHERE "id"='MS1_COMPLETENESS';
  `);
};

exports._meta = {
  version: 1,
};
