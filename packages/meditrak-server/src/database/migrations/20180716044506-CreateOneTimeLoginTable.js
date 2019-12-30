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
  return db.createTable('one_time_login', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'one_time_logins_user_id_users_id_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      token: { type: 'text', notNull: true, unique: true },
      creation_date: { type: 'timestamptz', defaultValue: new String('now()') },
      use_date: { type: 'timestamptz' },
    },
  });
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
