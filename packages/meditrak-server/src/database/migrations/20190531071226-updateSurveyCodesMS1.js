'use strict';

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

exports.up = async function(db) {
  // mapping surveys with endpoints
  const MS1_API_SURVEY_ENDPOINTS = {
    MCSR_S13: { route: 'basic-responses', method: 'PUT' },
    MCSR_S4I: { route: 'immunisations', method: 'PUT' },
    MCSR_S5FP: { route: 'family-planning', method: 'PUT' },
    MCSR_S6R: { route: 'referrals', method: 'POST' },
    MCSR_S7B: { route: 'births', method: 'POST' },
    MCSR_S8MD: { route: 'maternal-deaths', method: 'POST' },
    MCSR_S9D: { route: 'deaths', method: 'POST' },
    MCSR_MR: { route: 'malnutrition-register', method: 'PUT' },
    MCSR_S1M: { route: 'malnutrition', method: 'POST' },
    MCSR_S1CD: { route: 'chronic-diseases', method: 'PUT' },
    MCSR_RHD: { route: 'rheumatic-heart-diseases', method: 'POST' },
    MCSR_S1OR: { route: 'outbreak-reporting', method: 'PUT' },
    MCSR_S1MR: { route: 'morbidity-reporting', method: 'POST' },
    MCSR_II: { route: 'insert-iucd', method: 'POST' },
    MCSR_IR: { route: 'remove-iucd', method: 'POST' },
    MCSR_JI: { route: 'insert-jadell', method: 'POST' },
    MCSR_JR: { route: 'remove-jadell', method: 'POST' },
    MCSR_CID: { route: 'child-immunisation', method: 'POST' },
    MCSR_GF: { route: 'gender-based-violence', method: 'POST' },
  };
  await Promise.all(
    Object.keys(MS1_API_SURVEY_ENDPOINTS).map(key => {
      const value = MS1_API_SURVEY_ENDPOINTS[key];
      return db.runSql(`
        UPDATE survey SET integration_metadata = '{"ms1": { "endpoint": ${JSON.stringify(
          value,
        )} } }'
          WHERE code = '${key}';
      `);
    }),
  );
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
