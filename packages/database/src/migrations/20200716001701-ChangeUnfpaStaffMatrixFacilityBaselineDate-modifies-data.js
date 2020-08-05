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
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{MaxBaseLine}', '"2021-01-01"')
    WHERE id = 'UNFPA_Staff_Trained_Matrix';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{MaxBaseLine}', '"2020-01-01"')
    WHERE id = 'UNFPA_Staff_Trained_Matrix';
  `);
};

exports._meta = {
  "version": 1
};
