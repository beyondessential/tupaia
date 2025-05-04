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

exports.up = function (db) {
  /**
   * Update value with key `link` in `template_variables`
   */
  return db.runSql(`
    update feed_item
    set template_variables = regexp_replace (
                      template_variables :: text,
                      '(?<=https:\/\/mobile.tupaia.org\/)(country|facility)',
                      'explore')::json
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
