'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT_ID = 'COVID_Daily_Cases_By_Type';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{labels,dailysurvey003}', '"New confirmed cases"')
    where "id" = '${REPORT_ID}';

    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{labels,dailysurvey004}', '"New deaths"')
    where "id" = '${REPORT_ID}'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{labels,dailysurvey003}', '"New confirmed cases today"')
    where "id" = '${REPORT_ID}';

    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{labels,dailysurvey004}', '"New deaths today"')
    where "id" = '${REPORT_ID}'
  `);
};

exports._meta = {
  version: 1,
};
