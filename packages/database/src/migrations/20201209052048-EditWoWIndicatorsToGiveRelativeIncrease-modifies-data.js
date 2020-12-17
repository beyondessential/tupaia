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

const CONDITION_CODES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

// eg 'PSSS_Confirmed_AFR_Site_Average'
const psssCode = (descriptor, condition = '', isConfirmed = false) => {
  const parts = ['PSSS', descriptor];
  if (condition) {
    parts.splice(1, 0, condition);
  }
  if (isConfirmed) {
    parts.splice(1, 0, 'Confirmed');
  }

  return parts.join('_');
};

const editWoWIndicator = (db, condition = '', isConfirmed = false) => {
  return db.runSql(`
      UPDATE indicator
      SET config = jsonb_set(config, '{formula}', '"(${psssCode(
        'Site_Average',
        condition,
        isConfirmed,
      )} - siteAveragePrevWeek) / siteAveragePrevWeek"')
      WHERE code = '${psssCode('WoW_Increase', condition, isConfirmed)}';
  `);
};

exports.up = function (db) {
  return Promise.all(
    CONDITION_CODES.map(code =>
      Promise.all([editWoWIndicator(db, code), editWoWIndicator(db, code, true)]),
    ),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
