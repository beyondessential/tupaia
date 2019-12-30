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
    UPDATE "answer"
    SET "text" = 'Fully Operational'
    WHERE "question_id"='59085faccc42a44705c02a7e' AND "text"='Open';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
