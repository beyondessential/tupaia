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
  return db.createTable('user_geographical_area_permission', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_geographical_area_permission_user_account_id_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
          mapping: 'id',
        },
      },
      geographical_area_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_geographical_area_permission_geographical_area_id_fk',
          table: 'geographical_area',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
          mapping: 'id',
        },
      },
      permission_group_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_geographical_area_permission_permission_group_id_fk',
          table: 'permission_group',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
          mapping: 'id',
        },
      },
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
