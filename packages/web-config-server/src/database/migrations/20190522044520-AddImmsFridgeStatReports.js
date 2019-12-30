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
      "id", "dataBuilder", "dataBuilderConfig", "viewJson"
    ) VALUES (
      'Imms_FridgeSoH', 'latestDataValuesInGroup', '{"dataElementGroupCode": "Imms_Fridge_SoH"}', '{"name": "Vaccine stock on hand", "type": "view", "viewType": "multiValue"}'
    );

    INSERT INTO "dashboardReport" (
      "id", "dataBuilder", "dataBuilderConfig", "viewJson"
    ) VALUES (
      'Imms_FridgePhotos', 'multiDataValuesLatestSurvey', '{"dataElementGroupCode": "Imms_Fridge_Photos", "surveyDataElementCode": "VIMMS"}', '{"name": "Storage Fridge Photos", "type": "view", "viewType": "multiPhotograph"}'
    );
    
    INSERT INTO "dashboardReport" (
      "id", "dataBuilder", "dataBuilderConfig", "viewJson"
    ) VALUES (
      'Imms_FridgeDailyTemperatures',
      'finalValuesPerDay',
      '{"dataElementCodes": ["FRIDGE_MAX_TEMP", "FRIDGE_MIN_TEMP"]}',
      '{"name": "Daily Fridge Temperatures", "type": "chart", "chartType": "line", "periodGranularity": "day"}'
    );

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name"
    ) VALUES (
      'Facility',
      'Donor',
      'VU',
      '{"Imms_FridgeDailyTemperatures", "Imms_FridgeSoH", "Imms_FridgePhotos"}',
      'Immunisation'
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
