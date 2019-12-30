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
  return db.runSql(`
    INSERT INTO user_reward (id,user_id,coconuts,type,record_id,creation_date)
    SELECT sr.id, user_id, 1, 'SurveyResponse', sr.id, end_time
    FROM   survey_response sr, survey s
    where  sr.survey_id = s.id
    and    can_repeat = true
    and    sr.id not in (select record_id from user_reward)
  `);
};

exports.down = function(db) {
  return db.runSql(`
  DELETE FROM user_reward WHERE record_id IN (
    SELECT id FROM survey_response WHERE survey_id IN (
      SELECT id FROM survey WHERE can_repeat = true
      )
  );
  `);
};

exports._meta = {
  "version": 1
};
