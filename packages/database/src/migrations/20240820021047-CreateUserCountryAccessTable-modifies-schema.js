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

exports.up = async function (db) {
  await db.createTable('user_country_access_attempt', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'user_country_access_user_id_fk',
          table: 'user_account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      country_code: { type: 'text', notNull: true },
    },
    ifNotExists: true,
  });
  await db.addIndex(
    'user_country_access_attempt',
    'user_country_access_attempt_user_id_idx',
    ['user_id'],
    false,
  );
  return db.addIndex(
    'user_country_access_attempt',
    'user_country_access_attempt_country_code_idx',
    ['country_code'],
    false,
  );
};

exports.down = function (db) {
  return db.dropTable('user_country_access_attempt');
};

exports._meta = {
  version: 1,
};
