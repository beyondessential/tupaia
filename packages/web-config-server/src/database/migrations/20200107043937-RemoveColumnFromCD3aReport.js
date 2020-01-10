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
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{"columns": {"CD3a_003": {}, "CD3a_006": {}, "CD3a_007": {"sortOrder": 1}, "$eventOrgUnitName": {"title": "Village", "sortOrder": 1}}}'
        WHERE "id"='TO_CD_Validation_CD3' AND "drillDownLevel" is NULL;

  `);
};

exports.down = function(db) {
  return db.runSql(`
   
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{"columns": {"CD3a_003": {}, "CD3a_005": {}, "CD3a_006": {}, "CD3a_007": {"sortOrder": 1}, "$eventOrgUnitName": {"title": "Village", "sortOrder": 1}}}'
        WHERE "id"='TO_CD_Validation_CD3' AND "drillDownLevel" is NULL;

  `);
};

exports._meta = {
  "version": 1
};