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
      "dataBuilderConfig" = "dataBuilderConfig" - 'isDenominatorAnnual' ||
      jsonb_build_object('fillEmptyValues', "dataBuilderConfig"::jsonb->'isDenominatorAnnual')
    WHERE
      "dataBuilderConfig" ? 'isDenominatorAnnual'
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'fillEmptyValues' ||
      jsonb_build_object('isDenominatorAnnual', "dataBuilderConfig"::jsonb->'fillEmptyValues')
    WHERE
      "dataBuilderConfig" ? 'fillEmptyValues'
  `);
};

exports._meta = {
  version: 1,
};
