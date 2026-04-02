'use strict';

import { updateValues, codeToId } from '../utilities';

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

const QUESTION_CODE = 'PW_EH01_003';
const QUESTION_TABLE = 'question';
const HOOK = 'entityAttributeHouseholdHead';

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
