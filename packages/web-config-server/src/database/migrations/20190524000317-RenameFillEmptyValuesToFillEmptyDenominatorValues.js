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
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'fillEmptyValues' ||
      jsonb_build_object(
        'fillEmptyDenominatorValues',
        "dataBuilderConfig"::jsonb->'fillEmptyValues'
      )
    WHERE
      "dataBuilderConfig" ? 'fillEmptyValues'
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'fillEmptyDenominatorValues' ||
      jsonb_build_object(
        'fillEmptyValues',
        "dataBuilderConfig"::jsonb->'fillEmptyDenominatorValues'
      )
    WHERE
      "dataBuilderConfig" ? 'fillEmptyDenominatorValues'
  `);
};

exports._meta = {
  version: 1,
};
