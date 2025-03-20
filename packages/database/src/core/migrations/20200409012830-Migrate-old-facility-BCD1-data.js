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
  -- (Open, Operational) -> Fully Operational
  UPDATE answer SET text = 'Fully Operational' 
  WHERE id in (
    SELECT answer.id FROM answer 
      JOIN question on answer.question_id = question.id 
    WHERE question.code = 'BCD1' 
      AND (answer.text = 'Open' 
      OR  answer.text = 'Operational'));

  -- Operational but closed today -> Operational but closed this week
  UPDATE answer SET text = 'Operational but closed this week' 
  WHERE id in (
    SELECT answer.id FROM answer 
      JOIN question on answer.question_id = question.id 
    WHERE question.code = 'BCD1' 
      AND answer.text = 'Operational but closed today');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
