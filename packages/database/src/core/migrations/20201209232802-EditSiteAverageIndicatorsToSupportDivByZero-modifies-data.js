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

const editSiteAverageIndicator = (db, condition = '', isConfirmed = false) => {
  const sitesReported = psssCode(
    !isConfirmed ? 'Total_Sites_Reported' : 'Sites_Reported',
    '',
    isConfirmed,
  );
  const cases = psssCode(!isConfirmed ? 'Total_Cases' : 'Cases', condition, isConfirmed);
  const siteAverage = psssCode('Site_Average', condition, isConfirmed);
  return db.runSql(`
      UPDATE indicator
      SET config = jsonb_set(config, '{formula}', '"${sitesReported} == 0 ? 0 : ${cases} / ${sitesReported}"')
      WHERE code = '${siteAverage}';
  `);
};

exports.up = function (db) {
  return Promise.all(
    CONDITION_CODES.map(code =>
      Promise.all([editSiteAverageIndicator(db, code), editSiteAverageIndicator(db, code, true)]),
    ),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
