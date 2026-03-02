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
    DELETE FROM dhis_sync_log dsl
    USING survey_response sr, survey s
    WHERE dsl.record_type = 'survey_response'
    AND dsl.record_id = sr.id
    AND sr.survey_id = s.id
    AND s.code in ('FLWV', 'DS', 'DTC', 'APS', 'FWV');

    DELETE FROM dhis_sync_log dsl
    USING answer a, survey_response sr, survey s
    WHERE dsl.record_type = 'answer'
    AND dsl.record_id = a.id
    AND a.survey_response_id = sr.id
    AND sr.survey_id = s.id
    AND s.code in ('FLWV', 'DS', 'DTC', 'APS', 'FWV');
  `);

  await db.runSql(`
    DELETE FROM dhis_sync_queue dsq
    USING survey_response sr, survey s
    WHERE dsq.record_type = 'survey_response'
    AND dsq.record_id = sr.id
    AND sr.survey_id = s.id
    AND s.code in ('FLWV', 'DS', 'DTC', 'APS', 'FWV');

    DELETE FROM dhis_sync_queue dsq
    USING answer a, survey_response sr, survey s
    WHERE dsq.record_type = 'answer'
    AND dsq.record_id = a.id
    AND a.survey_response_id = sr.id
    AND sr.survey_id = s.id
    AND s.code in ('FLWV', 'DS', 'DTC', 'APS', 'FWV');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
