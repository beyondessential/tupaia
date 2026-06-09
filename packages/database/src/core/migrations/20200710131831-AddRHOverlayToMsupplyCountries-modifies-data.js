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

// Vanuatu, Solomon Islands, Tonga and Kiribati*
const countryCodes = ['VU', 'SB', 'TO', 'KI'];

const originalValues = [
  {
    name: '0',
    color: 'Red',
    value: '0',
  },
  {
    name: '<1 MOS',
    color: 'Yellow',
    value: '1',
  },
  {
    name: '1-2 MOS',
    color: 'Green',
    value: '2',
  },
  {
    name: '>2 MOS',
    color: 'Orange',
    value: '3',
  },
];

const newValues = [
  {
    name: '0',
    color: 'Red',
    value: '0',
  },
  {
    name: '<1 MOS',
    color: 'Orange',
    value: '1',
  },
  {
    name: '1-2 MOS',
    color: 'Green',
    value: '2',
  },
  {
    name: '>2 MOS',
    color: 'Yellow',
    value: '3',
  },
  {
    name: 'No Data',
    color: 'Grey',
    value: null,
  },
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = "countryCodes" || '{${countryCodes}}',
    "values" = '${JSON.stringify(newValues)}'::jsonb 
    WHERE "groupName" = 'Reproductive Health Commodities (mSupply)';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = '{DL}',
    "values" = '${JSON.stringify(originalValues)}'::jsonb 
    WHERE "groupName" = 'Reproductive Health Commodities (mSupply)';
  `);
};

exports._meta = {
  version: 1,
};
