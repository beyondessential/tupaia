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
    S13: { route: 'basic-responses', method: 'PUT' },
    S4I: { route: 'immunisations', method: 'PUT' },
    S5FP: { route: 'family-planning', method: 'PUT' },
    S6R: { route: 'referrals', method: 'POST' },
    S7B: { route: 'births', method: 'POST' },
    S8MD: { route: 'maternal-deaths', method: 'POST' },
    S9D: { route: 'deaths', method: 'POST' },
    MR: { route: 'malnutrition-register', method: 'PUT' },
    S1M: { route: 'malnutrition', method: 'POST' },
    S1CD: { route: 'chronic-diseases', method: 'PUT' },
    RHD: { route: 'rheumatic-heart-diseases', method: 'POST' },
    S1OR: { route: 'outbreak-reporting', method: 'PUT' },
    S1MR: { route: 'morbidity-reporting', method: 'POST' },
    II: { route: 'insert-iucd', method: 'POST' },
    IR: { route: 'remove-iucd', method: 'POST' },
    JI: { route: 'insert-jadell', method: 'POST' },
    JR: { route: 'remove-jadell', method: 'POST' },
    CID: { route: 'child-immunisation', method: 'POST' },
    GF: { route: 'gender-based-violence', method: 'POST' },
  };
  await db.runSql(`
    ALTER TABLE survey ADD COLUMN integration_metadata JSONB DEFAULT '{"dhis2":{"is_data_regional":true}}';
  `);
  await db.runSql(`
    UPDATE survey SET integration_metadata = '{ "dhis2": { "is_data_regional": false } }'
    WHERE is_data_regional = false;
  `);
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
  await db.runSql(`
    UPDATE survey SET integration_metadata = '{"dhis2":{"is_data_regional":true}}'
    WHERE is_data_regional is NULL;
  `);
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
