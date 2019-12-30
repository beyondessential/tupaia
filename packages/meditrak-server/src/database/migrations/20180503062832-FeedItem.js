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
  return db.createTable('feed_item', {
    columns: {
      id: { type: 'text', primaryKey: true },
      country_id: {
        type: 'text',
        foreignKey: {
          name: 'feed_item_country_fk',
          table: 'country',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      geographical_area_id: {
        type: 'text',
        foreignKey: {
          name: 'feed_item_geographical_area_fk',
          table: 'geographical_area',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      user_id: {
        type: 'text',
        foreignKey: {
          name: 'feed_item_user_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      permission_group_id: {
        type: 'text',
        foreignKey: {
          name: 'feed_item_permission_group_fk',
          table: 'permission_group',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      model_name: { type: 'text' },
      model_id: { type: 'text' },
      cached_item: { type: 'json' },
    },
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
