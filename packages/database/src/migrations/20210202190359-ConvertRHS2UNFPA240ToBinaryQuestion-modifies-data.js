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

const questionCode = 'RHS2UNFPA240';

exports.up = function (db) {
  return db.runSql(`
    update "question" 
    set "type" = 'Binary'
    where code = '${questionCode}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "question" 
    set "type" = 'FreeText'
    where code = '${questionCode}';
  `);
};

exports._meta = {
  version: 1,
};
