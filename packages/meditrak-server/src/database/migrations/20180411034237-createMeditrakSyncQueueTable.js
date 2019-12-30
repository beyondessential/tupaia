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
  return db.createTable('meditrak_sync_queue', {
    columns: {
      id: { type: 'text', primaryKey: true },
      type: { type: 'text', notNull: true },
      record_type: { type: 'text', notNull: true },
      record_id: { type: 'text', notNull: true },
      change_time: {
        type: 'float',
        length: 17,
        defaultVaue: new String(
          "(floor((date_part('epoch'::text, clock_timestamp()) * (1000)::double precision)) + ((nextval('change_time_seq'::regclass))::double precision / (100)::double precision))",
        ),
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
