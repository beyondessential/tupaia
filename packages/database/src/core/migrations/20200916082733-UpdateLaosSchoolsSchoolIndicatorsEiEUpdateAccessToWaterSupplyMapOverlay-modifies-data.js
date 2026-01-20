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

const OVERLAY_ID = 'Laos_Schools_School_Indicators_Access_To_Clean_Water';

const OLD_MEASURE_BUILDER_CONFIG = {
  groups: {
    Multiple: {
      value: ', ',
      operator: 'regex',
    },
    SchCVD010a: {
      value: 'Water system (num papa)',
      operator: '=',
    },
    SchCVD010b: {
      value: 'Water borehole',
      operator: '=',
    },
    SchCVD010c: {
      value: 'Wells',
      operator: '=',
    },
    SchCVD010d: {
      value: 'Water connection from community gravity-fed water system',
      operator: '=',
    },
    SchCVD010e: {
      value: 'Water from river',
      operator: '=',
    },
    SchCVD010f: {
      value: 'Water from pond',
      operator: '=',
    },
    SchCVD010g: {
      value: 'Water reservoir',
      operator: '=',
    },
    SchCVD010h: {
      value: 'Other water source',
      operator: '=',
    },
    SchCVD010i: {
      value: 'Rainwater harvesting',
      operator: '=',
    },
    BCD29_event: {
      value: 'No',
      operator: '=',
    },
  },
  measureBuilder: 'getStringsFromBinaryData',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataElementToString: {
      SchCVD010a: {
        displayString: 'Water system (num papa)',
        valueOfInterest: 'Yes',
      },
      SchCVD010b: {
        displayString: 'Water borehole',
        valueOfInterest: 'Yes',
      },
      SchCVD010c: {
        displayString: 'Wells',
        valueOfInterest: 'Yes',
      },
      SchCVD010d: {
        displayString: 'Water connection from community gravity-fed water system',
        valueOfInterest: 'Yes',
      },
      SchCVD010e: {
        displayString: 'Water from river',
        valueOfInterest: 'Yes',
      },
      SchCVD010f: {
        displayString: 'Water from pond',
        valueOfInterest: 'Yes',
      },
      SchCVD010g: {
        displayString: 'Water reservoir',
        valueOfInterest: 'Yes',
      },
      SchCVD010h: {
        displayString: 'Other water source',
        valueOfInterest: 'Yes',
      },
      SchCVD010i: {
        displayString: 'Rainwater harvesting',
        valueOfInterest: 'Yes',
      },
      BCD29_event: {
        displayString: 'No',
        valueOfInterest: 'No',
      },
    },
  },
};
const NEW_MEASURE_BUILDER_CONFIG = {
  groups: {
    Multiple: {
      value: ', ',
      operator: 'regex',
    },
    SchCVD010a: {
      value: 'Tap water',
      operator: '=',
    },
    SchCVD010b: {
      value: 'Borehole',
      operator: '=',
    },
    SchCVD010c: {
      value: 'Well',
      operator: '=',
    },
    SchCVD010d: {
      value: 'Spring water (gravity-fed system)',
      operator: '=',
    },
    SchCVD010e: {
      value: 'River/stream',
      operator: '=',
    },
    SchCVD010f: {
      value: 'Pond',
      operator: '=',
    },
    SchCVD010g: {
      value: 'Reservoir',
      operator: '=',
    },
    SchCVD010h: {
      value: 'Other',
      operator: '=',
    },
    SchCVD010i: {
      value: 'Rainwater harvesting',
      operator: '=',
    },
    BCD29_event: {
      value: 'No',
      operator: '=',
    },
  },
  measureBuilder: 'getStringsFromBinaryData',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataElementToString: {
      SchCVD010a: {
        displayString: 'Tap water',
        valueOfInterest: 'Yes',
      },
      SchCVD010b: {
        displayString: 'Borehole',
        valueOfInterest: 'Yes',
      },
      SchCVD010c: {
        displayString: 'Well',
        valueOfInterest: 'Yes',
      },
      SchCVD010d: {
        displayString: 'Spring water (gravity-fed system)',
        valueOfInterest: 'Yes',
      },
      SchCVD010e: {
        displayString: 'River/stream',
        valueOfInterest: 'Yes',
      },
      SchCVD010f: {
        displayString: 'Pond',
        valueOfInterest: 'Yes',
      },
      SchCVD010g: {
        displayString: 'Reservoir',
        valueOfInterest: 'Yes',
      },
      SchCVD010h: {
        displayString: 'Other',
        valueOfInterest: 'Yes',
      },
      SchCVD010i: {
        displayString: 'Rainwater harvesting',
        valueOfInterest: 'Yes',
      },
      BCD29_event: {
        displayString: 'No',
        valueOfInterest: 'No',
      },
    },
  },
};

const OLD_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Water system (num papa)',
      color: 'magenta',
      value: 'SchCVD010a',
    },
    {
      name: 'Water borehole',
      color: 'green',
      value: 'SchCVD010b',
    },
    {
      name: 'Water connection from community gravity-fed water system',
      color: 'deepPink',
      value: 'SchCVD010d',
    },
    {
      name: 'Water from pond',
      color: 'orange',
      value: 'SchCVD010f',
    },
    {
      name: 'Water from river',
      color: 'yellow',
      value: 'SchCVD010e',
    },
    {
      name: 'Water reservoir',
      color: 'teal',
      value: 'SchCVD010g',
    },
    {
      name: 'Wells',
      color: 'blue',
      value: 'SchCVD010c',
    },
    {
      name: 'Rainwater harvesting',
      color: 'pink',
      value: 'SchCVD010i',
    },
    {
      name: 'Other water source',
      color: 'maroon',
      value: 'SchCVD010h',
    },
    {
      name: 'Multiple',
      color: 'purple',
      value: 'Multiple',
    },
    {
      name: 'No',
      color: 'red',
      value: 'BCD29_event',
    },
    {
      name: 'No data',
      color: 'grey',
      value: null,
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
      name: 'Tap water',
      color: 'magenta',
      value: 'SchCVD010a',
    },
    {
      name: 'Borehole',
      color: 'green',
      value: 'SchCVD010b',
    },
    {
      name: 'Spring water (gravity-fed system)',
      color: 'deepPink',
      value: 'SchCVD010d',
    },
    {
      name: 'Pond',
      color: 'orange',
      value: 'SchCVD010f',
    },
    {
      name: 'River/stream',
      color: 'yellow',
      value: 'SchCVD010e',
    },
    {
      name: 'Reservoir',
      color: 'teal',
      value: 'SchCVD010g',
    },
    {
      name: 'Well',
      color: 'blue',
      value: 'SchCVD010c',
    },
    {
      name: 'Rainwater harvesting',
      color: 'pink',
      value: 'SchCVD010i',
    },
    {
      name: 'Other',
      color: 'maroon',
      value: 'SchCVD010h',
    },
    {
      name: 'Multiple',
      color: 'purple',
      value: 'Multiple',
    },
    {
      name: 'No',
      color: 'red',
      value: 'BCD29_event',
    },
    {
      name: 'No data',
      color: 'grey',
      value: null,
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
    SET "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(OLD_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports._meta = {
  version: 1,
};
