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

exports.up = async function (db) {
  await db.runSql(`
    CREATE TABLE survey_response_draft (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      country_code TEXT,
      entity_id TEXT,
      start_time TEXT,
      form_data JSONB NOT NULL DEFAULT '{}',
      screen_number INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await db.runSql(`
    CREATE INDEX survey_response_draft_user_id_idx ON survey_response_draft(user_id);
  `);

  await db.runSql(`
    CREATE INDEX survey_response_draft_survey_id_idx ON survey_response_draft(survey_id);
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE IF EXISTS survey_response_draft;`);
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
