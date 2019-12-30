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
  return db.createTable('user_account', {
    columns: {
      id: { type: 'text', primaryKey: true },
      first_name: { type: 'text' },
      last_name: { type: 'text' },
      email: { type: 'text', notNull: true },
      gender: { type: 'text' },
      creation_date: { type: 'timestamp', defaultValue: new String('now()') },
      employer: { type: 'text' },
      position: { type: 'text' },
      mobile_number: { type: 'text' },
      password_hash: { type: 'text', notNull: true },
      password_salt: { type: 'text', notNull: true },
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
