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
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = 'TO_CH_Medication';

    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig" ,"viewJson", "dataSources")
    VALUES
      (
        'TO_CH_DM_Medication',
        'sumLatestData',
        '{ "dataElementCodes": ["CH267", "CH268", "CH269", "CH270", "CH271", "CH272", "CH273"] }',
        '{
          "name": "Medication in DM Cases",
          "type": "chart",
          "chartType": "bar",
          "periodGranularity": "one_year_at_a_time",
          "presentationOptions": { "hideAverage": true }
        }',
        '[{ "isDataRegional": false }]'
      );

    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig" ,"viewJson", "dataSources")
    VALUES
      (
        'TO_CH_HTN_CVD_Medication',
        'sumLatestData',
        '{
          "dataElementCodes": [
            "CH277",
            "CH278",
            "CH279",
            "CH280",
            "CH281",
            "CH282",
            "CH283",
            "CH284"
          ]
        }',
        '{
          "name": "Medication in HTN/CVD Cases",
          "type": "chart",
          "chartType": "bar",
          "periodGranularity": "one_year_at_a_time",
          "presentationOptions": { "hideAverage": true }
        }',
        '[{ "isDataRegional": false }]'
      );

    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig" ,"viewJson", "dataSources")
    VALUES
      (
        'TO_CH_DM_Medication_Dosage_Form',
        'sumLatestData',
        '{ "dataElementCodes": ["CH274", "CH275", "CH276"] }',
        '{
          "name": "DM Medication Dosage Form",
          "type": "chart",
          "chartType": "bar",
          "periodGranularity": "one_year_at_a_time",
          "presentationOptions": { "hideAverage": true }
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_Medication') ||
        '{ TO_CH_DM_Medication, TO_CH_HTN_CVD_Medication, TO_CH_DM_Medication_Dosage_Form }'
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );
  `);
};

exports.down = function(db) {
  // Revert chart to its previous state
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" IN (
        'TO_CH_DM_Medication',
        'TO_CH_HTN_CVD_Medication',
        'TO_CH_DM_Medication_Dosage_Form'
      );

    INSERT INTO
      "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig" ,"viewJson", "dataSources")
    VALUES
      (
        'TO_CH_Medication',
        'sumLatestData',
        '{
          "dataElementCodes": [
            "CH267",
            "CH268",
            "CH269",
            "CH270",
            "CH271",
            "CH272",
            "CH273",
            "CH274",
            "CH275",
            "CH276",
            "CH277",
            "CH278",
            "CH279",
            "CH280",
            "CH281",
            "CH282",
            "CH283",
            "CH284"
          ]
        }',
        '{
          "name": "Medication in DM and HTN Cases",
          "type": "chart",
          "chartType": "bar"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_DM_Medication')
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_HTN_CVD_Medication')
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_DM_Medication_Dosage_Form')
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ TO_CH_Medication }'
    WHERE
      "code" IN ('Tonga_Community_Health_Country', 'Tonga_Community_Health_District');
  `);
};

exports._meta = {
  version: 1,
};
