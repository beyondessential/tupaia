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
    INSERT INTO "dashboardReport" ("id","dataBuilder","dataBuilderConfig","viewJson")
    VALUES (
      'Raw_Data_STRIVE_PNG',
      'rawDataDownload',
      '{"surveys": [{"code": "SCRF", "name": "STRIVE Case Report Form"}, {"code": "SWTF", "name": "STRIVE Weekly Tally Form"}]}',
      '{"name": "Download Raw Data", "type": "view", "viewType": "dataDownload", "periodGranularity": "day"}'
    );

    INSERT INTO "dashboardGroup" ("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
    VALUES (
      'Country',
      'Strive PNG',
      'PG',
      '{Raw_Data_STRIVE_PNG}',
      'STRIVE Raw Data Downloads',
      'STRIVE_Raw_Data_Downloads'
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" WHERE "code" = 'STRIVE_Raw_Data_Downloads';
    DELETE FROM "dashboardReport" WHERE "id" = 'Raw_Data_STRIVE_PNG';
  `);
};

exports._meta = {
  version: 1,
};
