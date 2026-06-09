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

// CD2_2 is now a SubmissionDate question, so we don't need the answers stored in the database as
// the same information is held in survey_response.submission_time
exports.up = function (db) {
  return db.runSql(`
    DELETE FROM answer WHERE question_id IN (SELECT id FROM question WHERE code IN ('CD2_2', 'CD3a_005'));
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
