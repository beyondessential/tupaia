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

const SURVEY_CODE = 'RHFSC';
const COUNTRY_CODES = ['TO', 'KI', 'FJ', 'SB', 'VU', 'WS', 'MH', 'FM'];
const ORIGINAL_VALUE = '5b67d72df013d64e8129a660';

exports.up = async function (db) {
  const { rows: countries } = await db.runSql(`
      SELECT id FROM country WHERE code IN (${COUNTRY_CODES.map(cc => `'${cc}'`).join(', ')});
  `);
  const countryIds = countries.map(c => `${c.id}`).join(', ');

  return db.runSql(`
    UPDATE survey
    SET country_ids = '{${countryIds}}'
    WHERE code = '${SURVEY_CODE}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE survey
    SET country_ids = '{${ORIGINAL_VALUE}}'
    WHERE code = '${SURVEY_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
