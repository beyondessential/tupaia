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
  return db.createTable('user_clinic_permission', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_clinic_permission_user_account_id_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      clinic_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_clinic_permission_clinic_id_fk',
          table: 'clinic',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      permission_group_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_clinic_permission_permission_group_id_fk',
          table: 'permission_group',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
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
