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
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES
      (
        'TO_CH_DM_HTN_Complications_Screening',
        'percentagesPerDataClass',
        '{
          "range": [0, 1],
          "dataClasses": {
            "HBa1c": {
              "numerator": { "codes": ["HBa1c_Screenings"], "type": "group" },
              "denominator": { "codes": ["DM_HTN_Cases"], "type": "group" }
            },
            "eGFR": {
              "numerator": { "codes": ["eGFR_Screenings"], "type": "group" },
              "denominator": { "codes": ["DM_HTN_Cases"], "type": "group" }
            },
            "Fasting Cholesterol": {
              "numerator": { "codes": ["Fasting_Cholesterol_Screenings"], "type": "group" },
              "denominator": { "codes": ["DM_HTN_Cases"], "type": "group" }
            },
            "Eye Check": {
              "numerator": { "codes": ["Eye_Check_Screenings"], "type": "group" },
              "denominator": { "codes": ["DM_HTN_Cases"], "type": "group" }
            },
            "Foot Check": {
              "numerator": { "codes": ["Foot_Check_Screenings"], "type": "group" },
              "denominator": { "codes": ["DM_HTN_Cases"], "type": "group" }
            }
          }
        }',
        '{
          "name": "DM and HTN Complications Screening Completion",
          "type": "chart",
          "chartType": "bar",
          "valueType": "percentage",
          "periodGranularity": "one_year_at_a_time",
          "description":
            "Percentage of DM and HTN cases who completed HBa1c, Creatinine, Cholesterol, Eye Check, Foot Check within year"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" ||'{ TO_CH_DM_HTN_Complications_Screening }'
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
      "id" = 'TO_CH_DM_HTN_Complications_Screening';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_DM_HTN_Complications_Screening')
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
