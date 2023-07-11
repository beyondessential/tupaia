'use strict';

var dbm;
var type;
var seed;

const questionIds = [
  "'5deda1f461f76a0c97b79843'",
  "'5d2d315ef013d67a8e1aaeef'",
  "'5d2d315ef013d67a8e1a3895'",
  "'5d2d485cf013d60161393921'",
  "'5d2d485cf013d60161313667'",
  "'5d2d485cf013d601613772c7'",
  "'5d2d485cf013d6016137034d'",
  "'5d526adbf013d61a6214b078'",
  "'5da808d661f76a4d0f107c8d'",
  "'5d2d48a7f013d60161f992e9'",
  "'5d2d48a7f013d60161b99991'",
  "'5d2d48a7f013d60161bc125a'",
  "'5d2d48a7f013d60161e26e92'",
  "'5d2d4931f013d601616ffbc4'",
  "'5d2d4931f013d6016132ae10'",
  "'5d2d4931f013d6016163020a'",
  "'5d53e147f013d63ba541f1ed'",
  "'5d2d4960f013d601616d0f27'",
  "'5d2d4960f013d601613216d8'",
  "'5d2d4960f013d601613273e9'",
  "'5d2d4960f013d601612da000'",
  "'5d53e0c7f013d63ba510c52a'",
  "'5d2d4960f013d6016111e277'",
  "'5d2d4960f013d601613cacf5'",
];

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
      WHERE question_id IN (${questionIds});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
