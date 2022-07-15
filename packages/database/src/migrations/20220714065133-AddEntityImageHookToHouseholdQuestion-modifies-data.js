'use strict';

import { codeToId, updateValues } from '../utilities';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const QUESTION_CODE = 'PW_EH01_008';
const QUESTION_TABLE = 'question';
const HOOK = 'entityImage';

exports.up = async function (db) {
  const questionId = await codeToId(db, 'question', QUESTION_CODE);
  await updateValues(db, QUESTION_TABLE, { hook: HOOK }, { id: questionId });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
