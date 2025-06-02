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

/**
 * Add 'api' and 'method' columns to api_request_log
 *  api: the api that we're logging for (eg. 'central', 'meditrak', 'entity' etc.)
 *  method: the request method (eg. GET, POST, etc.), useful when multiple routes share the same endpoint
 */
exports.up = function (db) {
  return db.runSql(`
    ALTER TABLE api_request_log ADD COLUMN api TEXT;
    UPDATE api_request_log SET api = 'central';
    ALTER TABLE api_request_log ALTER COLUMN api SET NOT NULL;
    ALTER TABLE api_request_log ADD COLUMN method TEXT;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE api_request_log DROP COLUMN api;
    ALTER TABLE api_request_log DROP COLUMN method;
  `);
};

exports._meta = {
  version: 1,
};
