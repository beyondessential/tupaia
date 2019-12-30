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
  return db.createTable('question', {
    columns: {
      id: { type: 'text', primaryKey: true },
      text: { type: 'text', notNull: true },
      indicator: { type: 'text' },
      image_data: { type: 'text' },
      type: { type: 'text', notNull: true },
      options: { type: 'text' },
      code: { type: 'text' },
      detail: { type: 'text' },
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
