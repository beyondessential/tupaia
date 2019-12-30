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
      SET "dataBuilderConfig" = '{"dataElementGroupCode": "Imms_Fridge_Photos", "surveyDataElementCode": "Imms_Fridge_Photos"}'
      WHERE "id" = 'Imms_FridgePhotos';

      INSERT INTO "dashboardReport" (
        "id", "dataBuilder", "dataBuilderConfig", "viewJson"
      ) VALUES (
        'Imms_VaccinatedSchools',
        'percentagesByNominatedPairs',
        '{"pairs": {"VVP05":"VVP04"}}',
        '{"name": "% Schools Receiving Vaccines", "valueType": "percentage", "type": "view", "viewType": "singleValue"}'
      );

      INSERT INTO "dashboardReport" (
        "id", "dataBuilder", "dataBuilderConfig", "viewJson"
      ) VALUES (
        'Imms_StaffTrainedAndFundingReceived',
        'sumLatestData',
        '{"dataElementCodes": ["VVP02", "VVP03"]}',
        '{"name": "Training and Funding", "valueType": "boolean", "type": "view", "viewType": "multiValue"}'
      );

      INSERT INTO "mapOverlay"(
        "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
      )
      VALUES(
        'Two rounds of outreach funding received', 'Immunisations', 'Donor', 'VVP02', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{VU}'
      );

      INSERT INTO "mapOverlay"(
        "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
      )
      VALUES(
        'Staff Trained in Immunisations', 'Immunisations', 'Donor', 'VVP03', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{VU}'
      );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
