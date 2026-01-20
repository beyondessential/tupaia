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
    DELETE FROM "answer" a
    using survey_response sr
    join survey s on s.id = sr.survey_id 
    where a.survey_response_id = sr.id 
    and a.text = '9998'
    and s.name = 'Reproductive Health Combined';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
