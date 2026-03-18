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

const OVERLAY_ID = 'Laos_Schools_Hand_Washing_Facility_Available';

const OLD_DATA_ELEMENT_CODE = 'value';
const NEW_DATA_ELEMENT_CODE = 'SchFF004';

const OLD_MEASURE_BUILDER_CONFIG = {
  filter: {
    value: {
      in: [
        '3 sets of hand washing tables',
        '2 sets of hand washing tables',
        '1 set of hand washing tables',
        'Other',
        'No',
      ],
    },
  },
  dataElementCodes: ['SchFF004', 'SchCVD008'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};
const NEW_MEASURE_BUILDER_CONFIG = {
  // Remove combined data element codes
  //  filter: {
  //   value: {
  //     in: [
  //       '3 sets of hand washing tables',
  //       '2 sets of hand washing tables',
  //       '1 set of hand washing tables',
  //       'Other',
  //       'No',
  //     ],
  //   },
  // },
  // dataElementCodes: ['SchFF004', 'SchCVD008'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const OLD_PRESENTATION_OPTIONS = {
  values: [
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
  // Remove combined values
  // values: [
  //   {
  //     name: '3 sets of hand washing tables',
  //     color: 'yellow',
  //     value: '3 sets of hand washing tables',
  //   },
  //   {
  //     name: '2 sets of hand washing tables',
  //     color: 'blue',
  //     value: '2 sets of hand washing tables',
  //   },
  //   {
  //     name: '1 set of hand washing tables',
  //     color: 'teal',
  //     value: '1 set of hand washing tables',
  //   },
  //   {
  //     name: 'Other',
  //     color: 'green',
  //     value: 'Other',
  //   },
  //   {
  //     name: 'No',
  //     color: 'red',
  //     value: 'No',
  //   },
  // ],
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

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "dataElementCode" = '${NEW_DATA_ELEMENT_CODE}',
    "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "dataElementCode" = '${OLD_DATA_ELEMENT_CODE}',
    "measureBuilderConfig" = '${JSON.stringify(OLD_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports._meta = {
  version: 1,
};
