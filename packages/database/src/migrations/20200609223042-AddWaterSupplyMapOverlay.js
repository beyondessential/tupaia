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

const MAP_OVERLAY_ID = 'Laos_Schools_Functioning_Water_Supply';

const NEW_NAME = 'Access to clean water';

const OLD_NAME = 'Functioning water supply';

const FILTER = {
  value: {
    in: [
      'Rainwater harvesting',
      'Water borehole',
      'Water connection from community gravity-fed water system',
      'No',
    ],
  },
};

const NEW_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
  dataElementCodes: ['BCD29_event', 'SchCVD010'],
  filter: FILTER,
};

const OLD_MEASURE_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
};

const NEW_DATA_ELEMENT_CODE = 'value';

const OLD_DATA_ELEMENT_CODE = 'BCD29_event';

const NEW_VALUES = [
  {
    name: 'Rainwater harvesting',
    color: 'yellow',
    value: 'Rainwater harvesting',
  },
  {
    name: 'Water borehole',
    color: 'teal',
    value: 'Water borehole',
  },
  {
    name: 'Water connection from community gravity-fed water system',
    color: 'green',
    value: 'Water connection from community gravity-fed water system',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const OLD_VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const MAP_OVERLAY = {
  id: MAP_OVERLAY_ID,
  newName: NEW_NAME,
  oldName: OLD_NAME,
  newMeasureBuilderConfig: NEW_MEASURE_BUILDER_CONFIG,
  oldMeasureBuilderConfig: OLD_MEASURE_BUILDER_CONFIG,
  newDataElementCode: NEW_DATA_ELEMENT_CODE,
  oldDataElementCode: OLD_DATA_ELEMENT_CODE,
  newValues: NEW_VALUES,
  oldValues: OLD_VALUES,
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(MAP_OVERLAY.newMeasureBuilderConfig)}',
    "dataElementCode" = '${MAP_OVERLAY.newDataElementCode}',
    "values" = '${JSON.stringify(MAP_OVERLAY.newValues)}',
    name = '${MAP_OVERLAY.newName}',
    "presentationOptions" = "presentationOptions" || '{"measureLevel": "School"}'
    WHERE id = '${MAP_OVERLAY.id}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(MAP_OVERLAY.oldMeasureBuilderConfig)}',
    "dataElementCode" = '${MAP_OVERLAY.oldDataElementCode}',
    "values" = '${JSON.stringify(MAP_OVERLAY.oldValues)}',
    name = '${MAP_OVERLAY.oldName}',
    "presentationOptions" = "presentationOptions" - 'measureLevel'
    WHERE id = '${MAP_OVERLAY.id}';
  `);
};

exports._meta = {
  version: 1,
};
