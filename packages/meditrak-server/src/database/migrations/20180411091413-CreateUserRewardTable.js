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
  return db.createTable('user_reward', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: {
        type: 'text',
        unique: true,
        notNull: true,
        foreignKey: {
          name: 'user_reward_user_id_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      coconuts: { type: 'bigint', notNull: true, defaultValue: 0 },
      pigs: { type: 'bigint', notNull: true, defaultValue: 0 },
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
