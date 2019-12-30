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
    UPDATE
      answer
    SET
      text = 'Positive Mixed'
    WHERE
      text = 'Positive Pf or mixed'
    AND
      question_id = '5d8985c361f76a294a7b9499'; -- STR_CRF169

    UPDATE
      answer
    SET
      text = 'Negative'
    WHERE
      text = 'Negatve'
    AND
      question_id = '5d8985c361f76a294a7b9499'; -- STR_CRF169
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      answer
    SET
      text = 'Positive Pf or mixed'
    WHERE
      text = 'Positive Mixed'
    AND
      question_id = '5d8985c361f76a294a7b9499'; -- STR_CRF169

    UPDATE
      answer
    SET
      text = 'Negatve'
    WHERE
      text = 'Negative'
    AND
      question_id = '5d8985c361f76a294a7b9499'; -- STR_CRF169
  `);
};

exports._meta = {
  version: 1,
};
