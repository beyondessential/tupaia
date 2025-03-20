'use strict';

import { arrayToDbString } from '../utilities';

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

const BINARY_MEASURE_MAP_OVERLAY_IDS = [
  'Laos_Schools_Electricity_Available',
  'Laos_Schools_Internet_Connection_Available_In_School',
  'Laos_Schools_Functioning_Water_Supply',
  'Laos_Schools_Functioning_Toilet',
  'Laos_Schools_Hand_Washing_Facility_Available',
  'Laos_Schools_Schools_Received_Learning_Materials',
  'Laos_Schools_Schools_Provided_With_Cleaning_Materials',
  'Laos_Schools_Schools_Provided_With_Hygiene_Kids',
  'Laos_Schools_Schools_Received_Training_On_Safe_Protocols',
  'Laos_Schools_Schools_Implementing_Remedial_Education_Programmes',
  'Laos_Schools_Schools_Provided_With_Psychosocial_Support',
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
    value: ['No', 'null'],
  },
];

const NEW_VALUES = [
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

const OLD_PRESENTATION_OPTIONS = {
  hideByDefault: {
    'No,null': true,
  },
  displayOnLevel: 'District',
};

const NEW_PRESENTATION_OPTIONS = {
  hideByDefault: {
    null: true,
  },
  displayOnLevel: 'District',
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}',
    values = '${JSON.stringify(NEW_VALUES)}'
    WHERE "id" in (${arrayToDbString(BINARY_MEASURE_MAP_OVERLAY_IDS)});	
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}',
    values = '${JSON.stringify(OLD_VALUES)}'
    WHERE "id" in (${arrayToDbString(BINARY_MEASURE_MAP_OVERLAY_IDS)});	
  `);
};

exports._meta = {
  version: 1,
};
