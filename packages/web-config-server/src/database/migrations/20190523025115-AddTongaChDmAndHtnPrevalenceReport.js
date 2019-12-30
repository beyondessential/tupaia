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
    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES
      (
        'TO_CH_DM_HTN_Prevalence',
        'annualPercentages',
        '{
          "range": [0, 1],
          "series": [
            {
              "key": "DM males",
              "numeratorDataElementGroupCode": "DM_Males_25_plus",
              "denominatorDataElementGroupCode": "Males_25_plus"
            },
            {
              "key": "HTN males",
              "numeratorDataElementGroupCode": "HTN_Males_25_plus",
              "denominatorDataElementGroupCode": "Males_25_plus"
            },
            {
              "key": "DM females",
              "numeratorDataElementGroupCode": "DM_Females_25_plus",
              "denominatorDataElementGroupCode": "Females_25_plus"
            },
            {
              "key": "HTN females",
              "numeratorDataElementGroupCode": "HTN_Females_25_plus",
              "denominatorDataElementGroupCode": "Females_25_plus"
            }
          ],
          "fillEmptyValues": true
        }',
        '{
          "name": "DM and HTN Prevalence",
          "type": "chart",
          "chartType": "line",
          "chartConfig": {
            "DM males": {},
            "HTN males": {},
            "DM females": {},
            "HTN females": {}
          },
          "periodGranularity": "year",
          "description": "Prevalence rates of Diabetes and Hypertension for ≥ 25 years of age, by year, by gender"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" ||'{ TO_CH_DM_HTN_Prevalence }'
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = 'TO_CH_DM_HTN_Prevalence';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_DM_HTN_Prevalence')
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );
  `);
};

exports._meta = {
  version: 1,
};
