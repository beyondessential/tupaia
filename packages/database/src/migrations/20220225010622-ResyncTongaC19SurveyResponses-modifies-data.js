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

exports.up = function (db) {
  return db.runSql(`
    UPDATE survey_response
    SET end_time = end_time + interval '1 second'
    WHERE id IN (
      SELECT survey_response.id FROM survey_response
      JOIN survey ON survey.id = survey_response.survey_id
      WHERE survey.code IN ('CCRF', 'CCLF', 'CCFU', 'LRF_TO')
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE survey_response
    SET end_time = end_time - interval '1 second'
    WHERE id IN (
      SELECT survey_response.id FROM survey_response
      JOIN survey ON survey.id = survey_response.survey_id
      WHERE survey.code IN ('CCRF', 'CCLF', 'CCFU', 'LRF_TO');
    )
  `);
};

exports._meta = {
  version: 1,
};
