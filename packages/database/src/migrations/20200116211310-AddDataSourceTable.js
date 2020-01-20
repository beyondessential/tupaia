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

exports.up = async function(db) {
  await db.runSql(`CREATE TYPE service_type AS ENUM('dhis');`);

  return db.createTable('data_source', {
    columns: {
      id: { type: 'text', primaryKey: true },
      code: { type: 'text', notNull: true, unique: true },
      service_type: { type: 'service_type', notNull: true },
      config: { type: 'jsonb', notNull: true, default: '{}' },
    },
    ifNotExists: true,
  });
};

exports.down = async function(db) {
  await db.dropTable('data_source');
  return db.runSql('DROP TYPE service_type;');
};

exports._meta = {
  version: 1,
};
