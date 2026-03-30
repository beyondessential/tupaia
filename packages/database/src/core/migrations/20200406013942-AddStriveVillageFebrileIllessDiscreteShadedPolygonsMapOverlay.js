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

exports.up = function (db) {
  return db.runSql(
    `
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
      'STRIVE_FIS_Village_Number_Reported_Cases_In_Week',
      '# Febrile illness cases (STRIVE Cases)',
      'STRIVE Febrile illness surveilance (Village)',
      'STRIVE User',
      'value',
      'shading',
      'Red,Orange,Yellow,Lime,Green',
      true,
      '[{"name": "> 20", "color": "Red", "value": "0"}, {"name": "19 - 15", "color": "Orange", "value": "1"}, {"name": "14 - 10", "color": "Yellow", "value": "2"}, {"name": "9 - 6", "color": "Lime", "value": "3"}, {"name": "5 - 1", "color": "Green", "value": "4"}, {"name": "0", "color": "Grey", "value": "null"}]',
      false,
      false,
      false,
      NULL,
      0,
      '{"groups": {"0": {"value": 21, "operator": ">="}, "1": {"value": [15, 19], "operator": "range"}, "2": {"value": [10, 14], "operator": "range"}, "3": {"value": [6, 9], "operator": "range"}, "4": {"value": [1, 5], "operator": "range"}}, "programCode": "SCRF", "dataSourceType": "custom", "dataSourceEntityType": "village", "aggregationEntityType": "village"}',
      'groupEventsPerOrgUnit',
      '{}',
      '{PG}');
  `,
  );
};

exports.down = function (db) {
  return db.runSql(
    `
    DELETE FROM "mapOverlay" WHERE "id" = 'STRIVE_FIS_Village_Number_Reported_Cases_In_Week';
  `,
  );
};

exports._meta = {
  version: 1,
};
