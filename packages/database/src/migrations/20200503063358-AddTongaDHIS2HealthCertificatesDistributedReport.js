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

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const ALL_VALUE_CODES = [
  "CD65", //Shopkeeper - New
  "CD66", //Shopkeeper - Renewal
  "CD67", //Food Handler - New
  "CD68", //Food Handler - Renewal
];

const DATA_BUILDER_CONFIG = {
  "dataClasses": {
      "Shopkeeper": {
          "numerator": {
              "dataSource": {
                  "type": "single",
                  "codes": ['CD65', 'CD66' ]
              }
          },
          "denominator": {
              "dataSource": {
                  "type": "single",
                  "codes": ALL_VALUE_CODES
              }
          }
      },
      "Food Handler": {
          "numerator": {
              "dataSource": {
                  "type": "single",
                  "codes": ['CD67', 'CD68' ]
              }
          },
          "denominator": {
              "dataSource": {
                  "type": "single",
                  "codes": ALL_VALUE_CODES
              }
          }
      }
  }
};

const VIEW_JSON_CONFIG = {
  "name": "Health Certificates Distributed",
  "type": "chart",
  "chartType": "pie",
  "periodGranularity": "one_year_at_a_time",
  "valueType": "percentage",
  "defaultTimePeriod": {
    "value": "-1",
    "format": "years"
  }
};

const DASHBOARD_GROUPS_TO_ADD = ['Tonga_Communicable_Diseases_National'];

const REPORT_ID = 'TO_CD_Health_Certificates_Distributed';

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES (
      '${REPORT_ID}',
      'percentagesPerDataClassByMonth',
      '${JSON.stringify(DATA_BUILDER_CONFIG)}',
      '${JSON.stringify(VIEW_JSON_CONFIG)}',
      '[{"isDataRegional": false}]'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS_TO_ADD)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS_TO_ADD)});
  `);
};

exports._meta = {
  "version": 1
};