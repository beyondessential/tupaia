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
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"presentationOptions": {
      "1": {
        "color": "#279A63", "label": "Green", "stackId": "1"
      },
      "2": {
        "color": "#EE9A30", "label": "Orange", "stackId": "1"
      },
      "3": {
        "color": "#EE4230", "label": "Red", "stackId": "1"
      }
    }}'
    WHERE id = '36';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
