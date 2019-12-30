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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES (
      'WISH_Export_Surveys',
      'rawDataDownload',
      '{
        "surveys": [
          { "code": "WISH_2GM", "name": "2 - Government mapping" },
          { "code": "WISH_2GMM", "name": "2 - Government mapping methods" },
          { "code": "WISH_3CM", "name": "3 - Community mapping" },
          { "code": "WISH_4A", "name": "4A - Agriculture" },
          { "code": "WISH_4FAA", "name": "4B - Fisheries and Aquaculture" },
          { "code": "WISH_4R", "name": "4D - Recreation" },
          { "code": "WISH_4SO", "name": "4C - Sanitation Observations" },
          { "code": "WISH_4SQ", "name": "4C - Sanitation Questionnaire" },
          { "code": "WISH_5HO", "name": "5A - Household Observational" },
          { "code": "WISH_5HIS", "name": "5B Household Interview Survey" },
          { "code": "WISH_6CLD", "name": "6 - Chemistry Test Data" },
          { "code": "WISH_6PLD", "name": "6 - Physio Lab datasheet" },
          { "code": "WISH_6MTD", "name": "6 - Microbiology Test Data" },
          { "code": "WISH_WMKS", "name": "WISH MACMON KI Survey" }
        ]
      }',
      '{
        "name": "Download WISH Survey Data",
        "type": "view",
        "viewType": "dataDownload",
        "periodGranularity": "day"
      }',
      '[{ "isDataRegional": false }]'
    );

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code"
    ) VALUES (
      'Country', 'Admin', 'FJ', '{WISH_Export_Surveys}', 'Fiji Data Downloads', 'WISH_Export_Surveys'
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
  DELETE FROM "dashboardReport" WHERE id = 'WISH_Export_Surveys';
  DELETE FROM "dashboardGroup" WHERE code = 'WISH_Export_Surveys';
`);
};

exports._meta = {
  "version": 1
};
