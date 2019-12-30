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

const BASE_REPORT_ID = 'TO_HPU_Validation_HP_07';

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO
      "dashboardReport" ("id", "drillDownLevel", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES
      (
        '${BASE_REPORT_ID}',
        1,
        'singleColumnTable',
        '{
          "stripFromRowNames": "HP07 Trainings and Health: ",
          "columnTitle": "Number Attended",
          "dataElementCodes": [
            "HP288",
            "HP289",
            "HP290",
            "HP291",
            "HP292",
            "HP293",
            "HP294",
            "HP295",
            "HP296",
            "HP297"
          ]
        }',
        '{
          "name": "Monthly Trainings and Health Talks",
          "type": "chart",
          "chartType": "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "one_month_at_a_time"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{"drillDown": {"keyLink": "eventId", "parameterLink": "eventId"}}'
    WHERE
      id = '${BASE_REPORT_ID}' AND "drillDownLevel" IS NULL;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = '${BASE_REPORT_ID}' AND "drillDownLevel" = 1;

    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" - 'drillDown'
    WHERE
      id = '${BASE_REPORT_ID}' AND "drillDownLevel" IS NULL;
  `);
};

exports._meta = {
  version: 1,
};
