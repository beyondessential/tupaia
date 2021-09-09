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

const MAPPING = [
  {
    questionCode: 'STRVEC_AE-AT07',
    originAnswer: 'No mosquito sampled N/A',
    newAnswer: 'Nil mosquito sampled N/A',
  },
  {
    questionCode: 'STRVEC_AE-AT12',
    originAnswer: 'No mosquito sampled',
    newAnswer: 'Nil mosquito sampled',
  },
  {
    questionCode: 'STRVEC_AE-AT13',
    originAnswer: 'No mosquito sampled',
    newAnswer: 'Nil mosquito sampled',
  },
];

exports.up = async function (db) {
  return Promise.all(
    MAPPING.map(async ({ questionCode, originAnswer, newAnswer }) => {
      db.runSql(`
        UPDATE answer a
        SET text = '${newAnswer}'
        WHERE question_id = (SELECT q.id from question q where q.code = '${questionCode}') 
        AND a.text = '${originAnswer}'; 
      `);
    }),
  );
};

exports.down = async function (db) {
  return Promise.all(
    MAPPING.map(async ({ questionCode, originAnswer, newAnswer }) => {
      db.runSql(`
        UPDATE answer a
        SET text = '${originAnswer}'
        WHERE question_id = (SELECT q.id from question q where q.code = '${questionCode}') 
        AND a.text = '${newAnswer}'; 
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
