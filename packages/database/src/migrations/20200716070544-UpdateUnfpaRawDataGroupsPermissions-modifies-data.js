'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

//Tonga, Kiribati, Fiji, Marshall Islands, FSM, Solomon Islands, Vanuatu, Samoa
const COUNTRY_ORG_UNITS = ['TO', 'KI', 'FJ', 'SB', 'VU', 'WS', 'MH', 'FM'];
const BASE_CODE = '_UNFPA_Raw_Data_Downloads_Country_Admin';
const originalUserGroup = 'Admin';
const newUserGroup = 'UNFPA';

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
      SET "userGroup" = '${newUserGroup}'
      WHERE code IN (${arrayToDbString(
        COUNTRY_ORG_UNITS.map(orgUnit => `${orgUnit}${BASE_CODE}`),
      )});
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
      SET "userGroup" = '${originalUserGroup}'
      WHERE code IN (${arrayToDbString(
        COUNTRY_ORG_UNITS.map(orgUnit => `${orgUnit}${BASE_CODE}`),
      )});
  `);
};

exports._meta = {
  version: 1,
};
