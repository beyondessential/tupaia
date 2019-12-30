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
    SET "dataBuilderConfig" = '{"labels": {"DP9": "Inpatient beds", "SS190A": "TB Treatment"}, "dataElementCodes": ["SS128", "SS182", "SS190A", "SS192", "SS219", "DP9"]}'
    WHERE "id" = '18';

  UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{"labels": {"DP9": "Inpatient beds", "SS162": "Vaccination at facility", "SS190A": "TB Treatment"}, "dataElementCodes": ["SS162", "SS128", "SS182", "SS190A", "SS192", "SS219", "DP9"]}'
    WHERE "id" = '19';
`);
};

exports.down = function(db) {
  return db.runSql(`
  UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{"labels": {"DP9": "Inpatient beds"}, "dataElementCodes": ["SS128", "SS182", "SS190", "SS192", "SS219", "DP9"]}'
    WHERE "id" = '18';

  UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{"labels": {"DP9": "Inpatient beds", "SS162": "Vaccination at facility"}, "dataElementCodes": ["SS162", "SS128", "SS182", "SS190", "SS192", "SS219", "DP9"], "organisationUnitIsGroup": true}'
    WHERE "id" = '19';
`);
};

exports._meta = {
  "version": 1
};
