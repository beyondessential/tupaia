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
    SET "viewJson" = "viewJson" || '{ "name": "Infrastructure Impact At Surveyed Facilities", "presentationOptions": { "isTitleVisible": true } }'
    WHERE "id" = 'Disaster_Response_Infrastructure_Impact';
  `);
};

exports.down = function(db) {
  // Remove presentationOptions but don't worry about resetting name, without being displayed it is innocuous
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" - 'presentationOptions'
    WHERE "id" = 'Disaster_Response_Infrastructure_Impact';
  `);
};

exports._meta = {
  version: 1,
};
