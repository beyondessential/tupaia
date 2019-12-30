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
    SET    "viewJson" = '{"name": "Contact Tracing - Contacts", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    WHERE  id = 'TO_CD_Validation_CD3'
      and  "drillDownLevel" = '1';
  `);
};
    
exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET    "viewJson" = '{"name": "Contact Tracing - Contacts", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png", "periodGranularity": "one_month_at_a_time"}'
    WHERE  id = 'TO_CD_Validation_CD3'
    and    "drillDownLevel" = '1';
  `);
};

exports._meta = {
  "version": 1
};
