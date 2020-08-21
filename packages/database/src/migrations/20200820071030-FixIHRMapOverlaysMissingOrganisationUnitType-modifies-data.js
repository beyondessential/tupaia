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
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" || '{ "entityAggregation": { "aggregationType": "REPLACE_ORG_UNIT_WITH_ORG_GROUP", "dataSourceEntityType": "facility", "aggregationEntityType": "district" }, "aggregationType": "MOST_RECENT_PER_ORG_GROUP" }'
    WHERE "measureBuilder" = 'mostRecentValueFromChildren';

    UPDATE "mapOverlay"
    SET "measureBuilder" = 'valueForOrgGroup'
    WHERE "measureBuilder" = 'mostRecentValueFromChildren';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
