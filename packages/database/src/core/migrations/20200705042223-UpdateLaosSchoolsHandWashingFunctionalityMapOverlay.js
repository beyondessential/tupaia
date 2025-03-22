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

const MAP_OVERLAY_ID = 'Laos_Schools_Hand_Washing_Facility_Available';

const NEW_NAME = 'Functioning hand washing facilities';

const OLD_NAME = 'Hand washing facility available';

const FILTER = {
  value: {
    in: [
      '3 sets of hand washing tables',
      '2 sets of hand washing tables',
      '1 set of hand washing tables',
      'Other',
      'No',
    ],
  },
};

const NEW_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
  dataElementCodes: ['SchFF004', 'SchCVD008'],
  filter: FILTER,
};

const OLD_MEASURE_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
};

const NEW_DATA_ELEMENT_CODE = 'value';

const OLD_DATA_ELEMENT_CODE = 'SchFF004';

const NEW_VALUES = [
  {
    name: '3 sets of hand washing tables',
    color: 'yellow',
    value: '3 sets of hand washing tables',
  },
  {
    name: '2 sets of hand washing tables',
    color: 'blue',
    value: '2 sets of hand washing tables',
  },
  {
    name: '1 set of hand washing tables',
    color: 'teal',
    value: '1 set of hand washing tables',
  },
  {
    name: 'Other',
    color: 'green',
    value: 'Other',
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
