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
    DELETE FROM answer
    WHERE "text" ='99'
    AND survey_response_id = '5e3cc3b282f3577e878483cb'
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
