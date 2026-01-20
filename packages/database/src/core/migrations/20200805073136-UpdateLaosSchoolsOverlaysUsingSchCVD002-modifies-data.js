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

const OLD_NAME = 'Has been used as quarantine centre';

const NEW_NAME = 'School used as quarantine centre';

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
      name: 'Yes, currently used as a quarantine centre',
      color: 'green',
      value: 'Yes, currently used as a quarantine centre',
    },
    {
      name: 'Yes, no longer used and disinfected',
      color: 'teal',
      value: 'Yes, no longer used and disinfected',
    },
    {
      name: 'Yes, no longer used but not disinfected',
      color: 'blue',
      value: 'Yes, no longer used but not disinfected',
    },
    {
      name: 'No, never used as a quarantine centre',
      color: 'red',
      value: 'No, never used as a quarantine centre',
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

const OVERLAY_ID = 'Laos_Schools_Used_As_Quarantine_Centre';

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}',
    name = '${NEW_NAME}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}',
    name = '${OLD_NAME}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
