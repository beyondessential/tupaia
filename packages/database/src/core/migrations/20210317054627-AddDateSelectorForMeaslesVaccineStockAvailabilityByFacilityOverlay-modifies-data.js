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

const OVERLAY_ID = 'LA_EOC_Measles_Vaccine_Stock_Facility';

const NEW_PRESENTATION_OPTIONS = {
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
    {
      name: '<100% in stock',
      color: 'orange',
      value: '100%',
    },
  ],
  displayType: 'color',
  measureLevel: 'Facility',
  hideByDefault: {
    null: true,
  },
  periodGranularity: 'one_day_at_a_time',
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
    {
      name: '<100% in stock',
      color: 'orange',
      value: '100%',
    },
  ],
  displayType: 'color',
  measureLevel: 'facility',
  hideByDefault: {
    null: true,
  },
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}'
  `);
};

exports._meta = {
  version: 1,
};
