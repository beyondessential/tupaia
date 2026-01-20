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

exports.up = function (db) {
  return db.runSql(`
    INSERT INTO "dashboardReport" (
        "id",
        "dataBuilder",
        "dataBuilderConfig",
        "viewJson"
      )
    VALUES
      (
        'Raw_Data_Covid19',
        'rawDataDownload',
        '{
          "surveys": [
            {
              "code": "C1FAT",
              "name": "COVID-19 Facility Assessment Tool"
            }
          ]
        }',
        '{
          "name": "Download COVID-19 Raw Data",
          "periodGranularity": "day",
          "type": "view",
          "viewType": "dataDownload"
        }'
      );

      UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{Raw_Data_Covid19}'
      WHERE code = 'TO_Raw Data Downloads_Country_Admin';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{Raw_Data_Core_Surveys}'
    WHERE code = 'TO_Raw Data Downloads_Country_Admin';

    DELETE FROM "dashboardReport" where id = 'Raw_Data_Covid19';
  `);
};

exports._meta = {
  version: 1,
};
