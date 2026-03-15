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

const OLD_CONFIG = {
  conditions: {
    No: {
      SchCVD012: 0,
    },
    Yes: {
      SchCVD012: 1,
      SchCVD012a: 0,
    },
    'Yes, smart TV': {
      SchCVD012: 1,
      SchCVD012a: 1,
    },
  },
  dataElementCodes: ['SchCVD012', 'SchCVD012a'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const NEW_CONFIG = {
  conditions: {
    No: {
      condition: {
        SchCVD012: 0,
      },
    },
    Yes: {
      condition: {
        SchCVD012: 1,
        SchCVD012a: 0,
      },
    },
    'Yes, smart TV': {
      condition: {
        SchCVD012: 1,
        SchCVD012a: 1,
      },
    },
  },
  dataElementCodes: ['SchCVD012', 'SchCVD012a'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(NEW_CONFIG)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(OLD_CONFIG)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
