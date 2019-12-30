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
        'TO_RH_Validation_MCH_08',
        'tableFromDataElementGroups',
        '{
          "stripFromRowNames": "Annual Postnatal Clinic Coverage - Age Counts - ",
          "shouldShowTotalsRow": true,
          "stripFromColumnNames": "Annual Postnatal Clinic Coverage - Attendance Counts - ",
          "rowDataElementGroupSets": ["MCH_08_Age_Counts"],
          "columnDataElementGroupSets": ["MCH_08_Attendance_Counts"]
        }',
        '{
          "name": "Annual Postnatal Clinic Coverage",
          "type": "chart",
          "chartType": "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "one_year_at_a_time"
        }',
        '[{ "isDataRegional": false }]'
      );
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ TO_RH_Validation_MCH_08 }'
    WHERE
      "code" IN (
        'Tonga_Reproductive_Health_Facility_Validation',
        'Tonga_Reproductive_Health_Facility_Validation_DL'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'TO_RH_Validation_MCH_08';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_RH_Validation_MCH_08')
    WHERE
      "code" IN (
        'Tonga_Reproductive_Health_Facility_Validation',
        'Tonga_Reproductive_Health_Facility_Validation_DL'
      );
  `);
};

exports._meta = {
  version: 1,
};
