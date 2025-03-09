'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const MAP_OVERLAY_ID = 'COVID_AU_HOSPITALS_AND_TESTING_SITES';

exports.up = function (db) {
  return db.runSql(`
  INSERT INTO "mapOverlay" (	
    "id",	
    "name",	
    "groupName",	
    "userGroup",	
    "dataElementCode",	
    "displayType",	
    "customColors",	
    "isDataRegional",	
    "values",	
    "hideFromMenu",	
    "hideFromPopup",	
    "hideFromLegend",	
    "linkedMeasures",	
    "sortOrder",	
    "measureBuilderConfig",	
    "measureBuilder",	
    "presentationOptions",	
    "countryCodes")	
     
    VALUES (
    '${MAP_OVERLAY_ID}',
    'Health Facilities',
    'COVID-19 Australia',
    'Public',
    'facilityTypeCode',
    'color',
    NULL,
    true,
    '[{"name": "Public Hospital", "color": "seagreen", "value": 1}, {"name": "Private Hospital", "color": "dodgerblue", "value": 2}, {"name": "Pharmacy", "color": "darkgoldenrod", "value": 3}, {"name": "COVID-19 Testing site", "color": "firebrick", "value": 4}, {"name": "Other", "color": "purple", "value": "other"}]',
    false,
    false,
    false,
    NULL,
    '0',
    '{"aggregationEntityType": "facility"}',
    'valueForOrgGroup',
    '{"displayedValueKey": "facilityTypeName", "displayOnLevel": "SubDistrict" }',
    '{AU}');
  `);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${MAP_OVERLAY_ID}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
