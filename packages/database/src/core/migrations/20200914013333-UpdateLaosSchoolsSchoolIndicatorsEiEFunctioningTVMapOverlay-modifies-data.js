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

const OVERLAY_ID = 'Laos_Schools_Functioning_TV_Satellite';

const OLD_NAME = 'Functioning TV, satellite receiver and dish set';
const NEW_NAME = 'Functioning TV for teaching and learning purposes';

const OLD_DATA_ELEMENT_CODE = 'SchCVD012';
const NEW_DATA_ELEMENT_CODE = 'value';

const OLD_MEASURE_BUILDER = 'valueForOrgGroup';
const NEW_MEASURE_BUILDER = 'checkMultiConditionsByOrgUnit';

const OLD_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};
const NEW_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
  dataElementCodes: ['SchCVD012', 'SchCVD012a'],
  conditions: {
    Yes: {
      SchCVD012: 'Yes',
      SchCVD012a: 'No',
    },
    'Yes, smart TV': {
      SchCVD012: 'Yes',
      SchCVD012a: 'Yes',
    },
    No: {
      SchCVD012: 'No',
    },
  },
};

const OLD_PRESENTATION_OPTIONS = {
  values: [
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
  ],
  displayType: 'color',
  measureLevel: 'School',
  hideByDefault: {
    null: true,
  },
  displayOnLevel: 'District',
  popupHeaderFormat: '{code}: {name}',
};

const NEW_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Yes',
      color: 'green',
      value: 'Yes',
    },
    {
      name: 'Yes, smart TV',
      color: 'blue',
      value: 'Yes, smart TV',
    },
    {
      name: 'No',
      color: 'red',
      value: 'No',
    },
  ],
  displayType: 'color',
  measureLevel: 'School',
  hideByDefault: {
    null: true,
  },
  displayOnLevel: 'District',
  popupHeaderFormat: '{code}: {name}',
};

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${NEW_NAME}',
    "dataElementCode" = '${NEW_DATA_ELEMENT_CODE}',
    "measureBuilder" = '${NEW_MEASURE_BUILDER}',
    "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${OLD_NAME}',
    "dataElementCode" = '${OLD_DATA_ELEMENT_CODE}',
    "measureBuilder" = '${OLD_MEASURE_BUILDER}',
    "measureBuilderConfig" = '${JSON.stringify(OLD_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
