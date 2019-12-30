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
  return db.addColumn('survey', 'is_data_regional', { type: 'boolean', defaultValue: true }, () => {
    db.runSql(
      `
        UPDATE survey
        SET is_data_regional=false
        WHERE aggregation_server_name !='${defaultAggregationServer}'
      `,
      () => {
        db.removeColumn('survey', 'aggregation_server_name');
        db.removeColumn('dhis_sync_queue', 'server_name');
      },
    );
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
