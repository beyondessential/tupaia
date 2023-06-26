'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// eslint-disable-next-line func-names
exports.up = function (db) {
  return db.runSql(`
  INSERT INTO public."dashboardReport" (id,"drillDownLevel","dataBuilder","dataBuilderConfig","viewJson","dataServices") VALUES
    ('WHO_SURVEY',NULL,'simpleTableOfEvents', '{"dataElementCode": "WHOSPAR", "programCode": "WSRS"}',
    '{"name": "WHO SPAR Reporting Countries","type": "chart", "chartType": "bar", "valueType": "text", "startDate": "2010-01-01", "endDate": "2018-01-01", "entityHeader": "Western Pacific Region"}','[{"isDataRegional": true}]');
    `);
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardReport" where id = 'WHO_SURVEY'; 

  `);
};

exports._meta = {
  version: 1,
};
