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
  return db.createTable('answer', {
    columns: {
      id: { type: 'text', primaryKey: true },
      type: { type: 'text', notNull: true },
      survey_reponse_id: { type: 'text', notNull: true },
      question_id: { type: 'text', notNull: true },
      text: { type: 'text' },
    },
    ifNotExists: true,
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
