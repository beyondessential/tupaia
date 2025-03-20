'use strict';

import { arrayToDbString } from '../utilities';

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

const QUESTION_CODES = ['SchDP_vill', 'SchFFvill', 'SchPop_vill', 'SchQuar_vill', 'SchWash_vill'];

exports.up = function (db) {
  return db.runSql(`
    DELETE FROM answer a 
    USING question q
    WHERE q.id = a.question_id AND q.code IN (${arrayToDbString(QUESTION_CODES)})
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
