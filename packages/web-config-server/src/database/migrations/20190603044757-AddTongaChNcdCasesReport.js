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
        'TO_CH_NCD_Cases',
        'sumLatestSeriesData',
        '{
          "series": {
            "Males": {
              "dataClasses": {
                "Diabetes": {
                  "code": "DM_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Hypertension": {
                  "code": "HTN_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Ischemic Heart Disease": {
                  "code": "Ischemic_Heart_Disease_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Cancer": {
                  "code": "Cancer_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Asthma": {
                  "code": "Asthma_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Rheumatic Heart Disease": {
                  "code": "RHD_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Dyslipidemia": {
                  "code": "Dyslipidemia_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Gout": {
                  "code": "Gout_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Chronic Kidney Disease": {
                  "code": "Chronic_Kidney_Disease_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Chronic Obstructive AirwayDisease": {
                  "code": "Chronic_Obstructive_Airway_Disease_Males_25_plus",
                  "type": "dataElementGroup"
                },
                "Cerebral Vascular Accident": {
                  "code": "Cerebral_Vascular_Accident_Males_25_plus",
                  "type": "dataElementGroup"
                }
              }
            },
            "Females": {
              "dataClasses": {
                "Diabetes": {
                  "code": "DM_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Hypertension": {
                  "code": "HTN_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Ischemic Heart Disease": {
                  "code": "Ischemic_Heart_Disease_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Cancer": {
                  "code": "Cancer_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Asthma": {
                  "code": "Asthma_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Rheumatic Heart Disease": {
                  "code": "RHD_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Dyslipidemia": {
                  "code": "Dyslipidemia_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Gout": {
                  "code": "Gout_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Chronic Kidney Disease": {
                  "code": "Chronic_Kidney_Disease_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Chronic Obstructive Airway Disease": {
                  "code": "Chronic_Obstructive_Airway_Disease_Females_25_plus",
                  "type": "dataElementGroup"
                },
                "Cerebral Vascular Accident": {
                  "code": "Cerebral_Vascular_Accident_Females_25_plus",
                  "type": "dataElementGroup"
                }
              }
            }
          }
        }',
        '{
          "name": "NCD Cases",
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
      "dashboardReports" = "dashboardReports" ||'{ TO_CH_NCD_Cases }'
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
      "id" = 'TO_CH_NCD_Cases';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_NCD_Cases')
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
