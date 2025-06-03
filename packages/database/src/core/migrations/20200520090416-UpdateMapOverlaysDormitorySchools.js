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

const OVERLAY_ID = 'Laos_Schools_Dormitory_Schools';
const DATA_ELEMENT_CODE = 'SchFF003';
const OLD_VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No',
    color: 'grey',
    value: 'No',
  },
  {
    name: 'No',
    color: 'grey',
    value: null,
  },
];
const NEW_VALUES = [
  {
    name: 'School with dormitory',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'School with no dormitory',
    color: 'red',
    value: ['No', 'null'],
  },
];
const OLD_HIDE_BY_DEFAULT = {
  0: true,
  null: true,
};
const NEW_HIDE_BY_DEFAULT = {
  'No,null': true,
};

exports.up = function (db) {
  return db.runSql(`
  update "mapOverlay" set 
  "values" = '${JSON.stringify(NEW_VALUES)}'::jsonb,
  "measureBuilderConfig" = "measureBuilderConfig"::jsonb - 'dataElementCodes',
  "presentationOptions" = jsonb_set("presentationOptions", '{hideByDefault}', 
    '${JSON.stringify(NEW_HIDE_BY_DEFAULT)}'::jsonb)
  where "id" = '${OVERLAY_ID}';
`);
};

exports.down = function (db) {
  return db.runSql(`
  update "mapOverlay" set 
  "values" = '${JSON.stringify(OLD_VALUES)}'::jsonb,
  "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{dataElementCodes}', 
    '${JSON.stringify(DATA_ELEMENT_CODE)}'::jsonb),
  "presentationOptions" = jsonb_set("presentationOptions", '{hideByDefault}', 
    '${JSON.stringify(OLD_HIDE_BY_DEFAULT)}'::jsonb)
  where "id" = '${OVERLAY_ID}';
`);
};

exports._meta = {
  version: 1,
};
