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
  return db.runSql(`UPDATE survey_response SET data_time = submission_time AT TIME ZONE timezone`);
};

exports.down = async function (db) {
  return db.runSql(`UPDATE survey_response SET data_time = NULL`);
};

exports._meta = {
  version: 1,
};
