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
  return db.createTable('disasterEvent', {
    columns: {
      id: { type: 'text', primaryKey: true },
      date: { type: 'timestamptz', notNull: true },
      type: { type: 'disaster_event_type', notNull: true },
      organisationUnitCode: { type: 'text', notNull: true },
      disasterId: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'disaster_event_disaster_id_fk',
          table: 'disaster',
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
