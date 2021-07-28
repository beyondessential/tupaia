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

const questionCode = 'STRVEC_AE-AT13';
const originAnswer = 'No mosquito sampled';
const updatedAnswer = 'Nil mosquito sampled';

exports.up = async function (db) {
  return db.runSql(`
    UPDATE answer a
    SET text = '${updatedAnswer}'
    WHERE question_id = (SELECT q.id from question q where q.code = '${questionCode}') 
    AND a.text = '${originAnswer}'; 
  `);
};

exports.down = async function (db) {
  return db.runSql(`
    UPDATE answer a
    SET text = '${originAnswer}'
    WHERE question_id = (SELECT q.id from question q where q.code = '${questionCode}') 
    AND a.text = '${updatedAnswer}'; 
`);
};

exports._meta = {
  version: 1,
};
