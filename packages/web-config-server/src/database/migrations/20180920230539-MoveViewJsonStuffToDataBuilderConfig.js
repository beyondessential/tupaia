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
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('surveyCode', "viewJson"->'surveyCode'),
    "viewJson" = "viewJson" - 'surveyCode'
    WHERE "viewJson" ? 'surveyCode';


    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('dataElementColumnTitle', "viewJson"->'dataElementColumnTitle'),
    "viewJson" = "viewJson" - 'dataElementColumnTitle'
    WHERE "viewJson" ? 'dataElementColumnTitle';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('optionSetCode', "viewJson"->'optionSetCode'),
    "viewJson" = "viewJson" - 'optionSetCode'
    WHERE "viewJson" ? 'optionSetCode';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('dataElementGroup', "viewJson"->'dataElementGroup'),
    "viewJson" = "viewJson" - 'dataElementGroup'
    WHERE "viewJson" ? 'dataElementGroup';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('dataElementGroupSet', "viewJson"->'dataElementGroupSet'),
    "viewJson" = "viewJson" - 'dataElementGroupSet'
    WHERE "viewJson" ? 'dataElementGroupSet';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('surveyDataElementCode', "viewJson"->'surveyDataElementCode'),
    "viewJson" = "viewJson" - 'surveyDataElementCode'
    WHERE "viewJson" ? 'surveyDataElementCode';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
