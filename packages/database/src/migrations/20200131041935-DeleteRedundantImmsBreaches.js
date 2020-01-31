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

exports.up = function(db) {
  // Note that the relevant records on DHIS2 must be deleted first, see Edwin for
  return db.runSql(`
    -- Drop triggers so that all the deletes don't flood the sync queue - have taken care of them manually on dhis2
    DROP TRIGGER IF EXISTS survey_response_trigger
      ON survey_response;
    DROP TRIGGER IF EXISTS answer_trigger
      ON answer;

    DELETE
    FROM dhis_sync_log
    WHERE record_id_id IN (
      SELECT id
      FROM survey_response
      WHERE survey_id = '5d12f4e0f013d62f09114d5a'
      AND id NOT IN (
        SELECT min(id)
        FROM survey_response
        WHERE survey_id = '5d12f4e0f013d62f09114d5a'
        GROUP BY entity_id, submission_time
      )
    );

    DELETE
    FROM dhis_sync_queue
    WHERE record_id_id IN (
      SELECT id
      FROM survey_response
      WHERE survey_id = '5d12f4e0f013d62f09114d5a'
      AND id NOT IN (
        SELECT min(id)
        FROM survey_response
        WHERE survey_id = '5d12f4e0f013d62f09114d5a'
        GROUP BY entity_id, submission_time
      )
    );

    DELETE
    FROM answer
    WHERE survey_response_id IN (
      SELECT id
      FROM survey_response
      WHERE survey_id = '5d12f4e0f013d62f09114d5a'
      AND id NOT IN (
        SELECT min(id)
        FROM survey_response
        WHERE survey_id = '5d12f4e0f013d62f09114d5a'
        GROUP BY entity_id, submission_time
      )
    );

    DELETE
    FROM survey_response
    WHERE survey_id = '5d12f4e0f013d62f09114d5a'
    AND id NOT IN (
      SELECT min(id)
      FROM survey_response
      WHERE survey_id = '5d12f4e0f013d62f09114d5a'
      GROUP BY entity_id, submission_time
    );

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

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
