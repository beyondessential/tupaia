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

const OLD_MAP_OVERLAY_ID = 'Laos_Schools_Functioning_Water_Supply';

const NEW_MAP_OVERLAY_ID = 'Laos_Schools_School_Indicators_Access_To_Clean_Water';

const OLD_MEASURE_BUILDER = 'valueForOrgGroup';

const NEW_MEASURE_BUILDER = 'groupData';

const NEW_MEASURE_BUILDER_CONFIG = {
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
    SchCVD010f: {
      value: 'Water from pond',
      operator: '=',
    },
    SchCVD010e: {
      value: 'Water from river',
      operator: '=',
    },
    SchCVD010g: {
      value: 'Water reservoir',
      operator: '=',
    },
    SchCVD010i: {
      value: 'Rainwater harvesting',
      operator: '=',
    },
    SchCVD010h: {
      value: 'Other water source',
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
        valueOfInterest: 'Yes',
        displayString: 'Water system (num papa)',
      },
      SchCVD010b: {
        valueOfInterest: 'Yes',
        displayString: 'Water borehole',
      },
      SchCVD010c: {
        valueOfInterest: 'Yes',
        displayString: 'Wells',
      },
      SchCVD010d: {
        valueOfInterest: 'Yes',
        displayString: 'Water connection from community gravity-fed water system',
      },
      SchCVD010f: {
        valueOfInterest: 'Yes',
        displayString: 'Water from pond',
      },
      SchCVD010e: {
        valueOfInterest: 'Yes',
        displayString: 'Water from river',
      },
      SchCVD010g: {
        valueOfInterest: 'Yes',
        displayString: 'Water reservoir',
      },
      SchCVD010i: {
        valueOfInterest: 'Yes',
        displayString: 'Rainwater harvesting',
      },
      SchCVD010h: {
        valueOfInterest: 'Yes',
        displayString: 'Other water source',
      },
      BCD29_event: {
        valueOfInterest: 'No',
        displayString: 'No',
      },
    },
  },
};

const OLD_MEASURE_BUILDER_CONFIG = {
  filter: {
    value: {
      in: [
        'Rainwater harvesting',
        'Water borehole',
        'Water connection from community gravity-fed water system',
        'No',
      ],
    },
  },
  dataElementCodes: ['BCD29_event', 'SchCVD010'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const NEW_VALUES = [
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
];

const OLD_VALUES = [
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

const MAP_OVERLAY = {
  oldId: OLD_MAP_OVERLAY_ID,
  newId: NEW_MAP_OVERLAY_ID,
  oldMeasureBuilder: OLD_MEASURE_BUILDER,
  newMeasureBuilder: NEW_MEASURE_BUILDER,
  newMeasureBuilderConfig: NEW_MEASURE_BUILDER_CONFIG,
  oldMeasureBuilderConfig: OLD_MEASURE_BUILDER_CONFIG,
  newValues: NEW_VALUES,
  oldValues: OLD_VALUES,
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(MAP_OVERLAY.newMeasureBuilderConfig)}',
    "measureBuilder" = '${MAP_OVERLAY.newMeasureBuilder}',
    "values" = '${JSON.stringify(MAP_OVERLAY.newValues)}',
    id = '${MAP_OVERLAY.newId}'
    WHERE id = '${MAP_OVERLAY.oldId}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(MAP_OVERLAY.oldMeasureBuilderConfig)}',
    "measureBuilder" = '${MAP_OVERLAY.oldMeasureBuilder}',
    "values" = '${JSON.stringify(MAP_OVERLAY.oldValues)}',
    id = '${MAP_OVERLAY.oldId}'
    WHERE id = '${MAP_OVERLAY.newId}';
  `);
};

exports._meta = {
  version: 1,
};
