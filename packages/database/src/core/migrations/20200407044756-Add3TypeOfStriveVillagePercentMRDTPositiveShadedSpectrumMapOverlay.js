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

const addStriveMrdtPositiveMapOverlay = ({ id, name, numeratorRegex }) =>
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
  '${id}',
  '${name}',
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
  '{"dataSourceType":"custom","measureBuilders":{"numerator":{"measureBuilder":"countEventsPerOrgUnit","measureBuilderConfig":{"dataValues":{"STR_CRF169":{"value":"${numeratorRegex}","operator":"regex"}},"programCode":"SCRF"}},"denominator":{"measureBuilder":"countEventsPerOrgUnit","measureBuilderConfig":{"dataValues":{"STR_CRF165":"1"},"programCode":"SCRF"}}},"aggregationEntityType":"village"}',
  'composePercentagePerOrgUnit',
  '{"valueType": "percentage", "scaleType": "performance", "scaleColorScheme": "default"}',
  '{PG}');
`;

const deleteStriveMrdtPositiveMapOverlay = ({ id }) =>
  `
DELETE FROM "mapOverlay" WHERE "id" = '${id}';
`;

const mapOverlays = [
  {
    id: 'STRIVE_FIS_Village_Percent_mRDT_Positive_PF_In_Week',
    name: '% mRDT positive Pf (STRIVE Cases)',
    numeratorRegex: 'Positive Pf',
  },
  {
    id: 'STRIVE_FIS_Village_Percent_mRDT_Positive_Non_PF_In_Week',
    name: '% mRDT positive non-Pf (STRIVE Cases)',
    numeratorRegex: 'Positive Non-Pf',
  },
  {
    id: 'STRIVE_FIS_Village_Percent_mRDT_Positive_Mixed_In_Week',
    name: '% mRDT positive mixed (STRIVE Cases)',
    numeratorRegex: 'Positive Mixed',
  },
];

exports.up = function (db) {
  return Promise.all(
    mapOverlays.map(mapOverlay => {
      db.runSql(addStriveMrdtPositiveMapOverlay(mapOverlay));
    }),
  );
};

exports.down = function (db) {
  return Promise.all(
    mapOverlays.map(mapOverlay => {
      db.runSql(deleteStriveMrdtPositiveMapOverlay(mapOverlay));
    }),
  );
};

exports._meta = {
  version: 1,
};
