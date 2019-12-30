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
        'TO_CH_DM_HTN_Newly_Diagnosed',
        'sumLatestSeriesData',
        '{
          "series": {
            "Males": {
              "dataClasses": {
                "DM only": {
                  "code": "Newly_Diagnosed_DM_Only_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "HTN only": {
                  "code": "Newly_Diagnosed_HTN_Only_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "DM/HTN": {
                  "code": "Newly_Diagnosed_DM_HTN_Males_25_plus",
                  "type": "dataElementGroup"
                }
              }
            },
            "Females": {
              "dataClasses": {
                "DM only": {
                  "code": "Newly_Diagnosed_DM_Only_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "HTN only": {
                  "code": "Newly_Diagnosed_HTN_Only_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "DM/HTN": {
                  "code": "Newly_Diagnosed_DM_HTN_Females_25_plus",
                  "type": "dataElementGroup"
                }
              }
            }
          }
        }',
        '{
          "name": "Newly Diagnosed DM and HTN Cases",
          "type": "chart",
          "chartType": "bar",
          "chartConfig": {
            "Males": { "stackId": 1 },
            "Females": { "stackId": 2 }
          },
          "periodGranularity": "one_year_at_a_time",
          "description": "Case counts per NCD ≥ 25 years, by year, with gender breakdown"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" ||'{ TO_CH_DM_HTN_Newly_Diagnosed }'
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
      "id" = 'TO_CH_DM_HTN_Newly_Diagnosed';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_DM_HTN_Newly_Diagnosed')
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
