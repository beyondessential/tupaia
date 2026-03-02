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
  return db.runSql(`
    -- Drop triggers so that change notifications don't detect that all survey responses need
    -- resynchronisation (this also speeds up the migration a lot)
    DROP TRIGGER IF EXISTS survey_response_trigger
      ON survey_response;

    UPDATE survey_response SET data_time = submission_time AT TIME ZONE timezone;

    -- Recreate triggers
    CREATE TRIGGER survey_response_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON survey_response
      FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports.down = async function (db) {
  return db.runSql(`UPDATE survey_response SET data_time = NULL;`);
};

exports._meta = {
  version: 1,
};
