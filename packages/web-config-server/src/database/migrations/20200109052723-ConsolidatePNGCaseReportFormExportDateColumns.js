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
    SET "dataBuilderConfig" = "dataBuilderConfig" #- '{columns, STR_CRF04}',
        "viewJson" = jsonb_set("viewJson", '{exportConfig, dataElementHeader}', '"Date of sample collection"')
    WHERE id = 'PG_Strive_PNG_Case_Report_Form_Export';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{columns, STR_CRF04}', '{"title": "Date of sample collection"}'),
        "viewJson" = jsonb_set("viewJson", '{exportConfig, dataElementHeader}', '"Reporting period"')
    WHERE id = 'PG_Strive_PNG_Case_Report_Form_Export';
  `);
};

exports._meta = {
  version: 1,
};
