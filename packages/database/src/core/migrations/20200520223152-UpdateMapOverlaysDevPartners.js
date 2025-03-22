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

const MAP_OVERLAY_ID_PREFIX = 'Laos_Schools_Dev_Partner_';
const DEV_PARTNERS_OVERLAYS = [
  'SchDP_AEAL',
  'SchDP_CRS',
  'SchDP_HII',
  'SchDP_Plan',
  'SchDP_RtR',
  'SchDP_UNIC',
  'SchDP_WB',
  'SchDP_WC',
  'SchDP_WFP',
  'SchDP_WR',
  'SchDP_WV',
];
const OLD_VALUES = [
  {
    name: 'School Supported',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'School Not Supported',
    color: 'grey',
    value: 'No',
  },
  {
    name: 'School Not Supported',
    color: 'grey',
    value: null,
  },
];
const NEW_VALUES = [
  {
    name: 'School Supported',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'School Not Supported',
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

const doUpdate = (db, overLayId) => {
  return db.runSql(`
  update "mapOverlay" set 
  "values" = '${JSON.stringify(NEW_VALUES)}'::jsonb,
  "measureBuilderConfig" = "measureBuilderConfig"::jsonb - 'dataElementCodes',
  "presentationOptions" = jsonb_set("presentationOptions", '{hideByDefault}', 
    '${JSON.stringify(NEW_HIDE_BY_DEFAULT)}'::jsonb)
  where "id" = '${overLayId}';
`);
};

const doDowndate = (db, overLayId, dataElementCode) => {
  return db.runSql(`
  update "mapOverlay" set 
  "values" = '${JSON.stringify(OLD_VALUES)}'::jsonb,
  "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{dataElementCodes}', 
    '${JSON.stringify(dataElementCode)}'::jsonb),
  "presentationOptions" = jsonb_set("presentationOptions", '{hideByDefault}', 
    '${JSON.stringify(OLD_HIDE_BY_DEFAULT)}'::jsonb)
  where "id" = '${overLayId}';
`);
};

exports.up = async function (db) {
  await Promise.all(
    DEV_PARTNERS_OVERLAYS.map(dataElementCode => {
      return doUpdate(db, `${MAP_OVERLAY_ID_PREFIX}${dataElementCode}`);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    DEV_PARTNERS_OVERLAYS.map(dataElementCode => {
      return doDowndate(db, `${MAP_OVERLAY_ID_PREFIX}${dataElementCode}`, dataElementCode);
    }),
  );
};

exports._meta = {
  version: 1,
};
