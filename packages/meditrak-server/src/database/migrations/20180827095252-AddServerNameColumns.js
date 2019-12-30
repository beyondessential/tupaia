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
  var defaultAggregationServer = 'regional';
  db.addColumn('survey', 'aggregation_server_name', {
    type: 'string',
    defaultValue: defaultAggregationServer,
  });
  return db.addColumn('dhis_sync_queue', 'server_name', {
    type: 'string',
    defaultValue: defaultAggregationServer,
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
