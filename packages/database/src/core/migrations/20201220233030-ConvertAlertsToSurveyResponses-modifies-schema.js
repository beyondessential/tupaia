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
    DROP TABLE alert_comment;
    DROP TABLE alert;

    CREATE TABLE survey_response_comment (
      id TEXT PRIMARY KEY,
      survey_response_id TEXT NOT NULL,
      comment_id TEXT NOT NULL,
      FOREIGN KEY (survey_response_id) REFERENCES survey_response (id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
