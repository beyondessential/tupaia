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
    SET
      "dataBuilderConfig" = "dataBuilderConfig" || '{"includeTotal": true, "dataElementsToSum": ["CH324", "CH325"]}',
      "viewJson" = "viewJson" || '{"periodGranularity": "week", "presentationOptions": {"hideAverage": true}}'
    WHERE id = 'TO_CH_Descriptive_ClinicDressings';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
