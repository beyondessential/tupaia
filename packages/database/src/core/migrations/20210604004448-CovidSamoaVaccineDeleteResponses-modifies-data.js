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

// The purpose of this migration is to remove survey responses
// for the below survey so that they can be reimported.

// COVID Vaccine - Samoa
const surveyCode = 'COVIDVac_WS';

exports.up = async function (db) {
  await db.runSql(`
    -- Drop triggers so that change notifications don't slow the migration down to the point it fails
    -- This is safe because all data is internal, so no change handlers need to handle this for external sync queues
    DROP TRIGGER IF EXISTS survey_response_trigger
      ON survey_response;
    DROP TRIGGER IF EXISTS answer_trigger
      ON answer;

    -- Delete the answers
    DELETE FROM answer a
    USING 
      survey_response sr,
      survey s
    WHERE 
      s.code = '${surveyCode}'
      AND a.survey_response_id =sr.id
      AND s.id = sr.survey_id;

    -- Delete the survey responses
    DELETE FROM survey_response sr
    USING 
      survey s
    WHERE
      s.id = sr.survey_id
      AND s.code = '${surveyCode}';

    -- Recreate triggers
    CREATE TRIGGER survey_response_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON survey_response
      FOR EACH ROW EXECUTE PROCEDURE notification();
    CREATE TRIGGER answer_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON answer
      FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
