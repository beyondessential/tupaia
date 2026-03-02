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
      'STRIVE_FIS_Village_Percent_mRDT_Positive_In_Week',
      '% mRDT positive (STRIVE Cases)',
      'STRIVE Febrile illness surveilance (Village)',
      'STRIVE User',
      'value',
      'shaded-spectrum',
      NULL,
      true,
      '[{"color": "blue","value": "other"},{"color": "grey","value": null}]',
      false,
      false,
      false,
      NULL,
      0,
      '{"dataSourceType":"custom","measureBuilders":{"numerator":{"measureBuilder":"countEventsPerOrgUnit","measureBuilderConfig":{"dataValues":{"STR_CRF169":{"value":"Positive","operator":"regex"}},"programCode":"SCRF"}},"denominator":{"measureBuilder":"countEventsPerOrgUnit","measureBuilderConfig":{"dataValues":{"STR_CRF165":"1"},"programCode":"SCRF"}}},"aggregationEntityType":"village"}',
      'composePercentagePerOrgUnit',
      '{"valueType": "percentage", "scaleType": "performance", "scaleColorScheme": "default"}',
      '{PG}');
  `,
  );
};

exports.down = function (db) {
  return db.runSql(
    `
    DELETE FROM "mapOverlay" WHERE "id" = 'STRIVE_FIS_Village_Percent_mRDT_Positive_In_Week';
  `,
  );
};

exports._meta = {
  version: 1,
};
