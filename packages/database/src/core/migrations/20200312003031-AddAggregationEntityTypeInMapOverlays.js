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

exports.up = async function (db) {
  return db.runSql(
    `
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = "measureBuilderConfig" - ARRAY['level', 'organisationUnitLevel'];

    -- All "mostRecentValueFromChildren" overlays are currently aggregated in the region level
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{aggregationEntityType}', '"region"')
    WHERE
      "measureBuilder" = 'mostRecentValueFromChildren';

    -- All non "mostRecentValueFromChildren" overlays are currently aggregated in the facility level
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{aggregationEntityType}', '"facility"')
    WHERE
      "measureBuilder" <> 'mostRecentValueFromChildren';

    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_object('{aggregationEntityType, facility}')
    WHERE
      "measureBuilderConfig" IS NULL;
  `,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
